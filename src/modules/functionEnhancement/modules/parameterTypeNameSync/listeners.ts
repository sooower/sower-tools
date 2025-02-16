import ts from "typescript";

import { toUpperCamelCase } from "@/modules/shared/modules/configuration/utils";

import { format, vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";
import { findTypeDeclarationNode } from "@/shared/utils/typescript";
import { createSourceFileByEditor } from "@/shared/utils/vscode";
import { textEditUtils } from "@/shared/utils/vscode/textEdit";
import { CommonUtils } from "@utils/common";

export function registerOnDidSaveTextDocumentListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async doc => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (doc !== editor.document) {
                    return;
                }

                if (editor.document.languageId !== "typescript") {
                    return;
                }

                await syncFunctionParameterTypeName({ editor });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        })
    );
}

type TSyncFunctionParameterTypeNameOptions = {
    editor: vscode.TextEditor;
};

/**
 * Sync the type name of the function parameter with the function name.
 *
 * If the function has only one parameter with format `T${functionName}Options`,
 * then the type name of the parameter will be synced with the function name when
 * rename the function.
 */
async function syncFunctionParameterTypeName({
    editor,
}: TSyncFunctionParameterTypeNameOptions) {
    const doSyncFunctionParameterTypeName = (
        node: ts.Node
    ):
        | ts.FunctionDeclaration
        | ts.ArrowFunction
        | ts.MethodDeclaration
        | undefined => {
        if (
            !ts.isFunctionDeclaration(node) &&
            !ts.isArrowFunction(node) &&
            !ts.isMethodDeclaration(node)
        ) {
            return ts.forEachChild(node, doSyncFunctionParameterTypeName);
        }

        if (node.name === undefined || node.parameters?.length !== 1) {
            return;
        }

        const [parameter] = node.parameters;

        if (
            parameter.type === undefined ||
            !ts.isTypeReferenceNode(parameter.type)
        ) {
            return;
        }

        const paramTypeName = parameter.type.typeName.getText();
        const expectedParamTypeName = format(
            `T%sOptions`,
            toUpperCamelCase(node.name.getText())
        );
        if (
            !paramTypeName.toLowerCase().includes("option") ||
            paramTypeName === "TOptions" ||
            paramTypeName === expectedParamTypeName
        ) {
            return;
        }

        const typeDeclarationNode = findTypeDeclarationNode({
            sourceFile,
            typeName: paramTypeName,
        });
        CommonUtils.assert(
            typeDeclarationNode !== undefined,
            `Cannot find type declaration for ${paramTypeName} in current file.`
        );

        edits.push(
            textEditUtils.replaceTextOfNode({
                editor,
                node: typeDeclarationNode.name,
                newText: expectedParamTypeName,
            }),
            textEditUtils.replaceTextOfNode({
                editor,
                node: parameter.type,
                newText: expectedParamTypeName,
            })
        );
    };

    const edits: vscode.TextEdit[] = [];

    const sourceFile = createSourceFileByEditor(editor);
    ts.forEachChild(sourceFile, doSyncFunctionParameterTypeName);

    if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(editor.document.uri, edits);
        await vscode.workspace.applyEdit(edit);
    }
}
