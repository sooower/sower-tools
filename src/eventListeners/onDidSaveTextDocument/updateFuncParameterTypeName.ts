import { format } from "node:util";

import ts from "typescript";

import { vscode } from "@/shared";
import { toUpperCamelCase } from "@/shared/utils";
import CommonUtils from "@/shared/utils/commonUtils";
import { findTypeDeclarationNode } from "@/shared/utils/tsUtils";
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditUtils } from "@/shared/utils/vscode/textEditUtils";

type TUpdateFuncParameterTypeNameOptions = {
    editor: vscode.TextEditor;
};

export async function updateFuncParameterTypeName({
    editor,
}: TUpdateFuncParameterTypeNameOptions) {
    const edits: vscode.TextEdit[] = [];

    const sourceFile = getSourceFileByEditor(editor);
    ts.forEachChild(sourceFile, doUpdateFuncParameterTypeName);

    if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(editor.document.uri, edits);
        await vscode.workspace.applyEdit(edit);
    }

    function doUpdateFuncParameterTypeName(
        node: ts.Node
    ):
        | ts.FunctionDeclaration
        | ts.ArrowFunction
        | ts.MethodDeclaration
        | undefined {
        if (
            !ts.isFunctionDeclaration(node) &&
            !ts.isArrowFunction(node) &&
            !ts.isMethodDeclaration(node)
        ) {
            return ts.forEachChild(node, doUpdateFuncParameterTypeName);
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
            sourceFile: sourceFile,
            typeName: paramTypeName,
        });
        CommonUtils.assert(
            typeDeclarationNode !== undefined,
            `Cannot find type declaration for ${paramTypeName} in current file.`
        );

        edits.push(
            TextEditUtils.replaceTextOfNode({
                editor: editor,
                node: typeDeclarationNode.name,
                newText: expectedParamTypeName,
            }),
            TextEditUtils.replaceTextOfNode({
                editor: editor,
                node: parameter.type,
                newText: expectedParamTypeName,
            })
        );
    }
}
