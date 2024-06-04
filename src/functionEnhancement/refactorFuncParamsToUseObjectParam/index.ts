import { format } from "node:util";

import ts from "typescript";

import { vscode } from "@/src/shared";
import { extensionCtx, extensionName } from "@/src/shared/init";
import { ETsType } from "@/src/shared/types";
import { toUpperCamelCase } from "@/src/shared/utils";

let activatedEditor: vscode.TextEditor;
let sourceFile: ts.SourceFile;

export function subscribeRefactorFuncParametersToUseObjectParameter() {
    const refactorFuncParametersToUseObjectParameter =
        vscode.commands.registerCommand(
            `${extensionName}.functionEnhancement.refactorFuncParametersToUseObjectParameter`,
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
                    const functionNode =
                        findFunctionNodeAtPosition(cursorPosition);
                    if (functionNode === undefined) {
                        return;
                    }

                    await doRefactorFunctionParametersToUseObjectParameter(
                        functionNode
                    );
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        );

    extensionCtx.subscriptions.push(refactorFuncParametersToUseObjectParameter);
}

function findFunctionNodeAtPosition(position: ts.LineAndCharacter) {
    function find(
        node: ts.Node
    ): ts.FunctionDeclaration | ts.ArrowFunction | undefined {
        if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node)) {
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

async function doRefactorFunctionParametersToUseObjectParameter(
    node: ts.FunctionDeclaration | ts.ArrowFunction
) {
    /* Check node is named function declaration with parameters */

    if (node.name === undefined) {
        return;
    }

    if (node.parameters.length === 0) {
        return;
    }

    // Do not refactor if the function has only one reference(non-primitive) parameter
    const firstParameter = node.parameters[0];
    if (
        node.parameters.length === 1 &&
        firstParameter.type !== undefined &&
        ts.isTypeReferenceNode(firstParameter.type)
    ) {
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
    const typeDeclarationText = format(
        `\n\ntype ${typeName} = {\n\t%s\n};`,
        paramTypes.join(";")
    );
    const newParamsText = `{ ${paramNames.join(",")} }: ${typeName}`;

    /* Update editor text */

    const firstParam = node.parameters[0];
    const lastParam = node.parameters[node.parameters.length - 1];
    const firstParamStartPos = sourceFile.getLineAndCharacterOfPosition(
        firstParam.getStart()
    );
    const lastParamEndPos = sourceFile.getLineAndCharacterOfPosition(
        lastParam.getEnd()
    );
    await activatedEditor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(
                    firstParamStartPos.line,
                    firstParamStartPos.character
                ),
                new vscode.Position(
                    lastParamEndPos.line,
                    lastParamEndPos.character
                )
            ),
            newParamsText
        );
    });

    const funcStartPos = sourceFile.getLineAndCharacterOfPosition(
        node.getFullStart()
    );
    await activatedEditor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(funcStartPos.line, funcStartPos.character),
            typeDeclarationText
        );
    });
}
