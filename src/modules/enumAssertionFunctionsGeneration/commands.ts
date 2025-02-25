import ts from "typescript";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { mapEnumNameWithoutPrefix, prettierFormatFile } from "@/utils/common";
import {
    findEnumDeclarationNodeAtOffset,
    findFuncDeclarationNode,
} from "@/utils/typescript";
import {
    createSourceFileByEditor,
    isTypeScriptFile,
    textEditorUtils,
} from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { toLowerCamelCase } from "../shared/modules/configuration/utils";

export function registerCommandGenerateEnumAssertionFunctions() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.generateEnumAssertionFunctions`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (!isTypeScriptFile(editor.document)) {
                    return;
                }

                const enumNode = findEnumDeclarationNodeAtOffset({
                    sourceFile: createSourceFileByEditor(editor),
                    offset: editor.document.offsetAt(editor.selection.active),
                });
                CommonUtils.assert(
                    enumNode !== undefined,
                    `Can not found enum declaration, please check your code to generate one first.`
                );

                await generateEnumAssertionFunctions({
                    editor,
                    node: enumNode,
                });
            } catch (e) {
                logger.error("Failed to generate enum assertion functions.", e);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

type TGenerateEnumAssertionFunctionsOptions = {
    editor: vscode.TextEditor;
    node: ts.EnumDeclaration;
};

async function generateEnumAssertionFunctions({
    editor,
    node,
}: TGenerateEnumAssertionFunctionsOptions) {
    const nodeName = node.name.text;
    const enumMemberNames = node.members.map(it =>
        it.name.getText(createSourceFileByEditor(editor))
    );
    const enumNameWithoutPrefix = mapEnumNameWithoutPrefix(nodeName);
    const valName = toLowerCamelCase(enumNameWithoutPrefix);

    /* Update text */

    const assertFuncText = format(
        `
            export function assert%s(%s: string): %s {
                switch (%s) {
                    %s {
                        return %s;
                    }
                }
                throw new Error(\`Unexpected %s "\${%s}".\`);
            }
        `,
        enumNameWithoutPrefix,
        valName,
        nodeName,
        valName,
        enumMemberNames
            .map(memberName => `case ${nodeName}.${memberName}:`)
            .join("\n"),
        valName,
        valName,
        valName
    );
    const assertFuncDeclarationNode = findFuncDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        funcName: `assert${enumNameWithoutPrefix}`,
    });
    if (assertFuncDeclarationNode !== undefined) {
        await textEditorUtils.replaceTextOfNode({
            editor,
            node: assertFuncDeclarationNode,
            newText: assertFuncText,
        });
    } else {
        await textEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            node,
            text: assertFuncText,
        });
    }

    const assertOptionalFuncText = format(
        `
            export function assertOptional%s(%s: string | undefined): %s | undefined {
                if (%s === undefined) {
                    return undefined;
                }

                return assert%s(%s);
            }
        `,
        enumNameWithoutPrefix,
        valName,
        nodeName,
        valName,
        enumNameWithoutPrefix,
        valName
    );
    const assertOptionalFuncDeclarationNode = findFuncDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        funcName: `assertOptional${enumNameWithoutPrefix}`,
    });
    if (assertOptionalFuncDeclarationNode === undefined) {
        await textEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            node: CommonUtils.mandatory(
                findFuncDeclarationNode({
                    sourceFile: createSourceFileByEditor(editor),
                    funcName: `assert${enumNameWithoutPrefix}`,
                })
            ),
            text: assertOptionalFuncText,
        });
    }

    const assertNullableFuncText = format(
        `
            export function assertNullable%s(%s: string | null): %s | undefined {
                if (%s === null) {
                    return undefined;
                }

                return assert%s(%s);
            }
        `,
        enumNameWithoutPrefix,
        valName,
        nodeName,
        valName,
        enumNameWithoutPrefix,
        valName
    );
    const assertNullableFuncDeclarationNode = findFuncDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        funcName: `assertNullable${enumNameWithoutPrefix}`,
    });
    if (assertNullableFuncDeclarationNode === undefined) {
        await textEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            node: CommonUtils.mandatory(
                findFuncDeclarationNode({
                    sourceFile: createSourceFileByEditor(editor),
                    funcName: `assertOptional${enumNameWithoutPrefix}`,
                })
            ),
            text: assertNullableFuncText,
        });
    }

    await vscode.workspace.save(editor.document.uri);

    await textEditorUtils.replaceTextOfSourceFile({
        editor,
        newText: await prettierFormatFile(
            createSourceFileByEditor(editor).fileName
        ),
    });
}
