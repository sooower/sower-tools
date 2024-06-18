import { format } from "node:util";

import ts from "typescript";

import { vscode } from "@/shared";
import { toUpperCamelCase } from "@/shared/utils";
import CommonUtils from "@/shared/utils/commonUtils";
import { findTypeDeclarationNode } from "@/shared/utils/tsUtils";
import { TextEditUtil } from "@/shared/utils/vscUtils";

type TUpdateFuncParameterTypeNameOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
};

export async function updateFuncParameterTypeName({
    editor,
    sourceFile,
}: TUpdateFuncParameterTypeNameOptions) {
    const edits: vscode.TextEdit[] = [];
    ts.forEachChild(sourceFile, doUpdateFuncParameterTypeName);
    if (edits.length > 0) {
        const edit = new vscode.WorkspaceEdit();
        edit.set(editor.document.uri, edits);
        await vscode.workspace.applyEdit(edit);
    }

    function doUpdateFuncParameterTypeName(node: ts.Node) {
        if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node)) {
            return;
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
            TextEditUtil.replaceTextOfNode(
                editor,
                typeDeclarationNode.name,
                expectedParamTypeName
            ),
            TextEditUtil.replaceTextOfNode(
                editor,
                parameter.type,
                expectedParamTypeName
            )
        );
    }
}
