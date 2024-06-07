import { format } from "node:util";

import ts from "typescript";

import CommonUtils from "@/src/shared/utils/commonUtils";
import { vscode } from "../../shared";
import { extensionCtx, extensionName } from "../../shared/init";
import { mapEnumNameWithoutPrefix, toLowerCamelCase } from "../../shared/utils";
import {
    findEnumDeclarationNodeAtPosition,
    findFuncDeclarationNode,
} from "../../shared/utils/tsUtils";
import {
    insertTextAfterNode,
    replaceTextOfNode,
} from "../../shared/utils/vscUtils";

let activatedEditor: vscode.TextEditor;

export function subscribeGenerateEnumAssertionFunction() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.generateEnumAssertionFunction`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                activatedEditor = editor;

                const document = activatedEditor.document;
                const currentFilePath = activatedEditor.document.fileName;
                if (!currentFilePath.endsWith(".ts")) {
                    return;
                }

                const sourceFile = ts.createSourceFile(
                    document.fileName,
                    document.getText(),
                    ts.ScriptTarget.ES2015,
                    true
                );

                const cursorPosition = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    document.offsetAt(activatedEditor.selection.active)
                );
                const enumNode = findEnumDeclarationNodeAtPosition({
                    sourceFile,
                    position: cursorPosition,
                });
                if (enumNode === undefined) {
                    return;
                }

                await generateEnumAssertionFunction(enumNode);
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

async function generateEnumAssertionFunction(node: ts.EnumDeclaration) {
    const nodeName = node.name.text;
    const enumMemberNames = node.members.map((it) =>
        it.name.getText(getSourceFile())
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
            .map((memberName) => `case ${nodeName}.${memberName}:`)
            .join("\n"),
        valName,
        valName,
        valName
    );
    const assertFuncDeclarationNode = findFuncDeclarationNode({
        sourceFile: getSourceFile(),
        funcName: `assert${enumNameWithoutPrefix}`,
    });
    if (assertFuncDeclarationNode !== undefined) {
        await replaceTextOfNode({
            editor: activatedEditor,
            sourceFile: getSourceFile(),
            node: assertFuncDeclarationNode,
            newText: assertFuncText,
        });
    } else {
        await insertTextAfterNode({
            editor: activatedEditor,
            sourceFile: getSourceFile(),
            node: node,
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
        sourceFile: getSourceFile(),
        funcName: `assertOptional${enumNameWithoutPrefix}`,
    });
    if (assertOptionalFuncDeclarationNode === undefined) {
        await insertTextAfterNode({
            editor: activatedEditor,
            sourceFile: getSourceFile(),
            node: CommonUtils.mandatory(assertFuncDeclarationNode),
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
        sourceFile: getSourceFile(),
        funcName: `assertNullable${enumNameWithoutPrefix}`,
    });
    if (assertNullableFuncDeclarationNode === undefined) {
        await insertTextAfterNode({
            editor: activatedEditor,
            sourceFile: getSourceFile(),
            node: CommonUtils.mandatory(assertOptionalFuncDeclarationNode),
            text: assertNullableFuncText,
        });
    }
}

function getSourceFile() {
    return ts.createSourceFile(
        activatedEditor.document.fileName,
        activatedEditor.document.getText(),
        ts.ScriptTarget.ES2015,
        true
    );
}
