import { format } from "node:util";

import ts, { ArrowFunction } from "typescript";

import { vscode } from "@/shared";
import { toUpperCamelCase } from "@/shared/utils";
import CommonUtils from "@/shared/utils/commonUtils";
import { findTypeDeclarationNode } from "@/shared/utils/tsUtils";
import {
    getSourceFileByEditor,
    replaceTextOfNode,
} from "@/shared/utils/vscUtils";

type TUpdateFuncParameterTypeNameOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
};

export function updateFuncParameterTypeName({
    editor,
}: TUpdateFuncParameterTypeNameOptions) {
    ts.forEachChild(
        getSourceFileByEditor(editor),
        doUpdateFuncParameterTypeName
    );

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
            sourceFile: getSourceFileByEditor(editor),
            typeName: paramTypeName,
        });
        CommonUtils.assert(
            typeDeclarationNode !== undefined,
            `Cannot find type declaration for ${paramTypeName} in current file.`
        );
        void (async () => {
            await updateTypeDeclarationName({
                editor,
                node: typeDeclarationNode,
                newName: expectedParamTypeName,
            });
            await updateFuncFirstParameterName({
                editor,
                node,
                newParamsText: expectedParamTypeName,
            });
        })();
    }
}

type TUpdateTypeDeclarationNameOptions = {
    editor: vscode.TextEditor;
    node:
        | ts.TypeAliasDeclaration
        | ts.InterfaceDeclaration
        | ts.ClassDeclaration;
    newName: string;
};

async function updateTypeDeclarationName({
    editor,
    node,
    newName,
}: TUpdateTypeDeclarationNameOptions) {
    if (node.name === undefined) {
        return;
    }

    await replaceTextOfNode({
        editor,
        sourceFile: getSourceFileByEditor(editor),
        node: node.name,
        newText: newName,
    });
}

type TUpdateFuncFirstParameterNameOptions = {
    editor: vscode.TextEditor;
    node: ts.FunctionDeclaration | ArrowFunction;
    newParamsText: string;
};

async function updateFuncFirstParameterName({
    editor,
    node,
    newParamsText,
}: TUpdateFuncFirstParameterNameOptions) {
    if (node.name === undefined) {
        return;
    }

    if (node.parameters.length === 0) {
        return;
    }

    const [firstParam] = node.parameters;
    await replaceTextOfNode({
        editor,
        sourceFile: getSourceFileByEditor(editor),
        node: CommonUtils.mandatory(firstParam.type),
        newText: newParamsText,
    });
}
