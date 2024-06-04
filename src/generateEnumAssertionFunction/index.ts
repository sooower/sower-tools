import { format } from "node:util";

import ts from "typescript";

import { vscode } from "../shared";
import { extensionCtx, extensionName } from "../shared/init";
import {
    mapEnumName,
    toLowerCamelCase,
    toUpperCamelCase,
} from "../shared/utils";

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
                const enumNode = findEnumNodeAtPosition(cursorPosition);
                if (enumNode === undefined) {
                    return;
                }

                if (findAssertionFunction(enumNode.name.text)) {
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

function findEnumNodeAtPosition(position: ts.LineAndCharacter) {
    function find(node: ts.Node): ts.EnumDeclaration | undefined {
        if (!ts.isEnumDeclaration(node)) {
            return ts.forEachChild(node, find);
        }

        const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
        );

        if (line === position.line) {
            return node;
        }
    }

    return find(sourceFile);
}

function findAssertionFunction(enumTypeName: string) {
    function visit(node: ts.Node) {
        if (
            (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) &&
            node.name !== undefined &&
            node.name.text === assertFuncName
        ) {
            found = true;
        }
    }

    let found = false;
    const assertFuncName = `assert${toUpperCamelCase(
        mapEnumName(enumTypeName)
    )}`;
    ts.forEachChild(sourceFile, visit);

    return found;
}

async function doGenerateEnumAssertionFunction(node: ts.EnumDeclaration) {
    const nodeName = node.name.text;
    const enumMemberNames = node.members.map((it) =>
        it.name.getText(sourceFile)
    );
    const enumEndPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getEnd()
    );
    const enumName = nodeName.startsWith("E") ? nodeName.slice(1) : nodeName;
    const valName = toLowerCamelCase(enumName);
    const enumAssertFuncText = format(
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
        enumName,
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
    const enumAssertOptionalFuncText = format(
        `
            export function assertOptional%s(%s: string | undefined): %s | undefined {
                if (%s === undefined) {
                    return undefined;
                }

                return assert%s(%s);
            }
        `,
        enumName,
        valName,
        nodeName,
        valName,
        enumName,
        valName
    );
    const enumAssertNullableFuncText = format(
        `
            export function assertNullable%s(%s: string | null): %s | undefined {
                if (%s === null) {
                    return undefined;
                }

                return assert%s(%s);
            }
        `,
        enumName,
        valName,
        nodeName,
        valName,
        enumName,
        valName
    );

    await activatedEditor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(enumEndPos.line, enumEndPos.character),
            `\n\n ${enumAssertFuncText}\n\n${enumAssertOptionalFuncText}\n\n${enumAssertNullableFuncText}`
        );
    });
}
