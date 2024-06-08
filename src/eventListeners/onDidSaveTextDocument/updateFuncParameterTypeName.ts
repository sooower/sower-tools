import { format } from "node:util";

import ts, { ArrowFunction } from "typescript";

import { vscode } from "@/shared";
import { toUpperCamelCase } from "@/shared/utils";
import CommonUtils from "@/shared/utils/commonUtils";
import { findTypeDeclarationNode } from "@/shared/utils/tsUtils";
import { replaceTextOfNode } from "@/shared/utils/vscUtils";

let currEditor: vscode.TextEditor;
let currSourceFile: ts.SourceFile;

type TUpdateFuncParameterTypeNameOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
};

export function updateFuncParameterTypeName({
    editor,
    sourceFile,
}: TUpdateFuncParameterTypeNameOptions) {
    currEditor = editor;
    currSourceFile = sourceFile;

    ts.forEachChild(currSourceFile, doUpdateFuncParameterTypeName);
}

function doUpdateFuncParameterTypeName(node: ts.Node) {
    if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node)) {
        return;
    }

    if (node.parameters?.length !== 1) {
        return;
    }

    if (node.name === undefined) {
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

    if (!paramTypeName.toLowerCase().includes("option")) {
        return;
    }

    if (paramTypeName === "TOptions") {
        return;
    }

    const expectedParamTypeName = format(
        `T%sOptions`,
        toUpperCamelCase(node.name.getText())
    );
    if (paramTypeName === expectedParamTypeName) {
        return;
    }

    const typeDeclarationNode = findTypeDeclarationNode({
        sourceFile: currSourceFile,
        typeName: paramTypeName,
    });
    CommonUtils.assert(
        typeDeclarationNode !== undefined,
        `Cannot find type declaration for ${paramTypeName} in current file.`
    );
    void (async () => {
        await updateTypeDeclarationName(
            typeDeclarationNode,
            expectedParamTypeName
        );
        await updateFuncFirstParameterName(node, expectedParamTypeName);
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

    await replaceTextOfNode({
        editor: currEditor,
        sourceFile: currSourceFile,
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
    await replaceTextOfNode({
        editor: currEditor,
        sourceFile: currSourceFile,
        node: CommonUtils.mandatory(firstParam.type),
        newText: newParamsText,
    });
}
