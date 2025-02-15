import ts from "typescript";

import { format, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { mapEnumNameWithoutPrefix, prettierFormatFile } from "@/shared/utils";
import {
    findEnumDeclarationNodeAtOffset,
    findFuncDeclarationNode,
} from "@/shared/utils/tsUtils";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";
import { CommonUtils } from "@utils/common";

import { toLowerCamelCase } from "../common/utils";

export function registerCommandGenerateEnumAssertionFunctions() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.generateEnumAssertionFunctions`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (editor.document.languageId !== "typescript") {
                    return;
                }

                const enumNode = findEnumDeclarationNodeAtOffset({
                    sourceFile: getSourceFileByEditor(editor),
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
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
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
        it.name.getText(getSourceFileByEditor(editor))
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
        sourceFile: getSourceFileByEditor(editor),
        funcName: `assert${enumNameWithoutPrefix}`,
    });
    if (assertFuncDeclarationNode !== undefined) {
        await TextEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: assertFuncDeclarationNode,
            newText: assertFuncText,
        });
    } else {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
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
        sourceFile: getSourceFileByEditor(editor),
        funcName: `assertOptional${enumNameWithoutPrefix}`,
    });
    if (assertOptionalFuncDeclarationNode === undefined) {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: CommonUtils.mandatory(
                findFuncDeclarationNode({
                    sourceFile: getSourceFileByEditor(editor),
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
        sourceFile: getSourceFileByEditor(editor),
        funcName: `assertNullable${enumNameWithoutPrefix}`,
    });
    if (assertNullableFuncDeclarationNode === undefined) {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: CommonUtils.mandatory(
                findFuncDeclarationNode({
                    sourceFile: getSourceFileByEditor(editor),
                    funcName: `assertOptional${enumNameWithoutPrefix}`,
                })
            ),
            text: assertNullableFuncText,
        });
    }

    await vscode.workspace.save(editor.document.uri);

    await TextEditorUtils.replaceTextOfSourceFile({
        editor,
        sourceFile: getSourceFileByEditor(editor),
        newText: await prettierFormatFile(
            getSourceFileByEditor(editor).fileName
        ),
    });
}
