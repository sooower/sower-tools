import { format } from "node:util";

import ts from "typescript";

import { fs, vscode } from "../../shared";
import { extensionCtx } from "../../shared/init";
import { toUpperCamelCase } from "../../shared/utils";
import CommonUtils from "../../shared/utils/commonUtils";

let activatedEditor: vscode.TextEditor;
let sourceFile: ts.SourceFile;

export function subscribeRefactorFuncParameterTypeName() {
    const refactorFuncParameterTypeName =
        vscode.workspace.onDidSaveTextDocument(async (doc) => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                activatedEditor = editor;

                if (doc !== activatedEditor.document) {
                    return;
                }

                const currentFilePath = activatedEditor.document.fileName;
                if (!currentFilePath.endsWith(".ts")) {
                    return;
                }

                sourceFile = ts.createSourceFile(
                    currentFilePath,
                    fs.readFileSync(currentFilePath, "utf8"),
                    ts.ScriptTarget.ES2015,
                    true
                );
                ts.forEachChild(sourceFile, updateFuncParameterTypeName);
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        });

    extensionCtx.subscriptions.push(refactorFuncParameterTypeName);
}

function updateFuncParameterTypeName(funcNode: ts.Node) {
    if (!ts.isFunctionDeclaration(funcNode) && !ts.isArrowFunction(funcNode)) {
        return;
    }

    if (funcNode.parameters?.length !== 1) {
        return;
    }

    if (funcNode.name === undefined) {
        return;
    }

    const [parameter] = funcNode.parameters;

    if (
        parameter.type !== undefined &&
        ts.isTypeReferenceNode(parameter.type)
    ) {
        const paramTypeName = parameter.type.typeName.getText();

        if (!paramTypeName.toLowerCase().includes("option")) {
            return;
        }

        if (paramTypeName === "TOptions") {
            return;
        }

        const expectedParamTypeName = format(
            `T%sOptions`,
            toUpperCamelCase(funcNode.name.getText())
        );
        if (paramTypeName !== expectedParamTypeName) {
            const typeDeclarationNode = findTypeDeclarationNode(paramTypeName);
            CommonUtils.assert(
                typeDeclarationNode !== undefined,
                `Cannot find type declaration for ${paramTypeName} in current file.`
            );
            void (async () => {
                await updateTypeDeclarationName(
                    typeDeclarationNode,
                    expectedParamTypeName
                );
                await updateFuncFirstParameterName(
                    funcNode,
                    expectedParamTypeName
                );
            })();
        }
    }
}

function findTypeDeclarationNode(typeName: string): ts.Node | undefined {
    let typeDeclarationNode;

    function visit(node: ts.Node) {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
            typeDeclarationNode = node;
        } else if (
            ts.isInterfaceDeclaration(node) &&
            node.name.text === typeName
        ) {
            typeDeclarationNode = node;
        } else if (
            ts.isClassDeclaration(node) &&
            node.name?.text === typeName
        ) {
            typeDeclarationNode = node;
        } else {
            ts.forEachChild(node, visit);
        }
    }

    ts.forEachChild(sourceFile, visit);

    return typeDeclarationNode;
}

async function updateTypeDeclarationName(node: ts.Node, newName: string) {
    if (
        !ts.isInterfaceDeclaration(node) &&
        !ts.isClassDeclaration(node) &&
        !ts.isTypeAliasDeclaration(node)
    ) {
        return;
    }

    if (node.name === undefined) {
        return;
    }

    const typeDeclarationNameStartPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.name.getStart()
    );
    const typeDeclarationNameEndPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.name.getEnd()
    );

    await activatedEditor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(
                    typeDeclarationNameStartPos.line,
                    typeDeclarationNameStartPos.character
                ),
                new vscode.Position(
                    typeDeclarationNameEndPos.line,
                    typeDeclarationNameEndPos.character
                )
            ),
            newName
        );
    });
}

async function updateFuncFirstParameterName(
    node: ts.Node,
    newParamsText: string
) {
    if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node)) {
        return;
    }

    if (node.name === undefined) {
        return;
    }

    if (node.parameters.length === 0) {
        return;
    }

    const [firstParam] = node.parameters;
    const fistParamType = CommonUtils.mandatory(firstParam.type);
    const firstParamTypeStartPos = sourceFile.getLineAndCharacterOfPosition(
        fistParamType.getStart()
    );
    const firstParamTypeEndPos = sourceFile.getLineAndCharacterOfPosition(
        fistParamType.getEnd()
    );
    await activatedEditor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(
                    firstParamTypeStartPos.line,
                    firstParamTypeStartPos.character
                ),
                new vscode.Position(
                    firstParamTypeEndPos.line,
                    firstParamTypeEndPos.character
                )
            ),
            newParamsText
        );
    });
}
