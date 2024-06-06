import { format } from "node:util";

import ts, { ArrowFunction, InterfaceDeclaration } from "typescript";

import { fs, vscode } from "@/src/shared";
import { extensionCtx } from "@/src/shared/init";
import { toUpperCamelCase } from "@/src/shared/utils";
import CommonUtils from "@/src/shared/utils/commonUtils";
import { findTypeDeclarationNode } from "@/src/shared/utils/tsUtils";
import { replaceNodeText } from "@/src/shared/utils/vscUtils";

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
        parameter.type === undefined ||
        !ts.isTypeReferenceNode(parameter.type)
    ) {
        return;
    }

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
    if (paramTypeName === expectedParamTypeName) {
        return;
    }

    const typeDeclarationNode = findTypeDeclarationNode(
        sourceFile,
        paramTypeName
    );
    CommonUtils.assert(
        typeDeclarationNode !== undefined,
        `Cannot find type declaration for ${paramTypeName} in current file.`
    );
    void (async () => {
        await updateTypeDeclarationName(
            typeDeclarationNode,
            expectedParamTypeName
        );
        await updateFuncFirstParameterName(funcNode, expectedParamTypeName);
    })();
}

async function updateTypeDeclarationName(
    node:
        | ts.TypeAliasDeclaration
        | ts.InterfaceDeclaration
        | ts.ClassDeclaration,
    newName: string
) {
    if (node.name === undefined) {
        return;
    }

    await replaceNodeText({
        activatedEditor,
        sourceFile,
        node: node.name,
        newText: newName,
    });
}

async function updateFuncFirstParameterName(
    node: ts.FunctionDeclaration | ArrowFunction,
    newParamsText: string
) {
    if (node.name === undefined) {
        return;
    }

    if (node.parameters.length === 0) {
        return;
    }

    const [firstParam] = node.parameters;
    await replaceNodeText({
        activatedEditor,
        sourceFile,
        node: CommonUtils.mandatory(firstParam.type),
        newText: newParamsText,
    });
}
