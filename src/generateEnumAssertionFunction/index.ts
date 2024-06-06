import { format } from "node:util";

import ts from "typescript";

import { vscode } from "../shared";
import { extensionCtx, extensionName } from "../shared/init";
import { mapEnumNameWithoutPrefix, toLowerCamelCase } from "../shared/utils";
import {
    findEnumDeclarationNodeAtPosition,
    findFuncDeclarationNode,
} from "../shared/utils/tsUtils";
import { insertTextAfterNode, replaceNodeText } from "../shared/utils/vscUtils";

let activatedEditor: vscode.TextEditor;
let sourceFile: ts.SourceFile;

export async function subscribeGenerateEnumAssertionFunction() {
    const generateEnumAssertionFunction = vscode.commands.registerCommand(
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

                sourceFile = ts.createSourceFile(
                    document.fileName,
                    document.getText(),
                    ts.ScriptTarget.ES2015,
                    true
                );

                const cursorPosition = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    document.offsetAt(activatedEditor.selection.active)
                );
                const enumNode = findEnumDeclarationNodeAtPosition(
                    sourceFile,
                    cursorPosition
                );
                if (enumNode === undefined) {
                    return;
                }

                await doGenerateEnumAssertionFunction(enumNode);
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(generateEnumAssertionFunction);
}

async function doGenerateEnumAssertionFunction(node: ts.EnumDeclaration) {
    const nodeName = node.name.text;
    const enumMemberNames = node.members.map((it) =>
        it.name.getText(sourceFile)
    );
    const enumNameWithoutPrefix = mapEnumNameWithoutPrefix(nodeName);
    const valName = toLowerCamelCase(enumNameWithoutPrefix);

    /* Generate replaced or inserted text */

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

    /* Replace or insert text in activated editor */

    const assertOptionalFuncDeclarationNode = findFuncDeclarationNode(
        sourceFile,
        `assertOptional${enumNameWithoutPrefix}`
    );
    if (assertOptionalFuncDeclarationNode === undefined) {
        await insertTextAfterNode({
            activatedEditor,
            sourceFile,
            node,
            text: assertOptionalFuncText,
        });
    }

    const assertNullableFuncDeclarationNode = findFuncDeclarationNode(
        sourceFile,
        `assertNullable${enumNameWithoutPrefix}`
    );
    if (assertNullableFuncDeclarationNode === undefined) {
        await insertTextAfterNode({
            activatedEditor,
            sourceFile,
            node,
            text: assertNullableFuncText,
        });
    }

    const assertFuncDeclarationNode = findFuncDeclarationNode(
        sourceFile,
        `assert${enumNameWithoutPrefix}`
    );
    if (assertFuncDeclarationNode !== undefined) {
        await replaceNodeText({
            activatedEditor,
            sourceFile,
            node: assertFuncDeclarationNode,
            newText: assertFuncText,
        });
    } else {
        insertTextAfterNode({
            activatedEditor,
            sourceFile,
            node,
            text: assertFuncText,
        });
    }
}
