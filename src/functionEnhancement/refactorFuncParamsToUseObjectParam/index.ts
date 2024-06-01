import { format } from "node:util";

import ts from "typescript";

import { vscode } from "../../shared";
import { extensionCtx, extensionName } from "../../shared/init";
import { ETsType } from "../../shared/types";
import { toUpperCamelCase } from "../../shared/utils";

export function subscribeRefactorFuncParamsToUseObjectParam() {
    const refactorFuncParamsToUseObjectParam = vscode.commands.registerCommand(
        `${extensionName}.functionEnhancement.refactorFuncParamsToUseObjectParam`,
        async () => {
            try {
                const activeEditor = vscode.window.activeTextEditor;
                if (activeEditor === undefined) {
                    return;
                }

                const document = activeEditor.document;
                const sourceFile = ts.createSourceFile(
                    document.fileName,
                    document.getText(),
                    ts.ScriptTarget.Latest,
                    true
                );

                const cursorPosition = ts.getLineAndCharacterOfPosition(
                    sourceFile,
                    document.offsetAt(activeEditor.selection.active)
                );
                const functionNode = findFunctionNodeAtPosition(
                    sourceFile,
                    cursorPosition
                );
                if (functionNode === undefined) {
                    return;
                }

                await refactorFunctionParameters(
                    activeEditor,
                    sourceFile,
                    functionNode
                );
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(refactorFuncParamsToUseObjectParam);
}

function findFunctionNodeAtPosition(
    sourceFile: ts.SourceFile,
    position: ts.LineAndCharacter
) {
    function find(node: ts.Node): ts.Node | undefined {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isArrowFunction(node)
        ) {
            const { line } = sourceFile.getLineAndCharacterOfPosition(
                node.getStart()
            );
            if (line === position.line) {
                return node;
            }
        }
        return ts.forEachChild(node, find);
    }
    return find(sourceFile);
}

async function refactorFunctionParameters(
    activeEditor: vscode.TextEditor,
    sourceFile: ts.SourceFile,
    node: ts.Node
) {
    if (
        !ts.isFunctionDeclaration(node) &&
        !ts.isMethodDeclaration(node) &&
        !ts.isArrowFunction(node)
    ) {
        return;
    }

    if (node.name === undefined) {
        return;
    }

    if (node.parameters.length === 0) {
        return;
    }

    /* Generate new params */

    const paramNames = node.parameters.map((it) => it.name.getText(sourceFile));

    const paramTypes = node.parameters.map((it) => {
        const paramName = it.name.getText(sourceFile);
        const paramType = it.type?.getText(sourceFile) ?? ETsType.Unknown;
        const optional = it.questionToken !== undefined;

        return format(`%s%s: %s`, paramName, optional ? "?" : "", paramType);
    });
    const typeName = `T${toUpperCamelCase(node.name.getText())}Options`;
    const typeText = format(
        `\n\ntype ${typeName} = {\n\t%s\n};`,
        paramTypes.join(";")
    );
    const newParamsText = `{ ${paramNames.join(",")} }: ${typeName}`;

    /* Update editor text */

    const firstParam = node.parameters[0];
    const lastParam = node.parameters[node.parameters.length - 1];
    const firstParamPos = sourceFile.getLineAndCharacterOfPosition(
        // Because the parameter may contain decorators or modifiers,
        // use getStart instead of pos
        firstParam.getFullStart()
    );
    const lastParamPos = sourceFile.getLineAndCharacterOfPosition(
        lastParam.getEnd()
    );
    await activeEditor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(
                    firstParamPos.line,
                    firstParamPos.character
                ),
                new vscode.Position(lastParamPos.line, lastParamPos.character)
            ),
            newParamsText
        );
    });

    const funcStartPos = sourceFile.getLineAndCharacterOfPosition(
        node.getFullStart()
    );
    await activeEditor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(funcStartPos.line, funcStartPos.character),
            typeText
        );
    });
}
