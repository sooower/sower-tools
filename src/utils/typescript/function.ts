import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

export type TFunc =
    | ts.FunctionDeclaration
    | ts.ArrowFunction
    | ts.MethodDeclaration
    | ts.ConstructorDeclaration;

type TFindFuncDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    funcName: string;
};

export function findFuncDeclarationNode({
    sourceFile,
    funcName,
}: TFindFuncDeclarationNodeOptions) {
    const visit = (node: ts.Node): TFunc | undefined => {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isArrowFunction(node) ||
            ts.isMethodDeclaration(node)
        ) {
            if (node.name?.getText() === funcName) {
                return node;
            }

            return ts.forEachChild(node, visit);
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}

type TFindFuncOrCtorDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findFuncOrCtorDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindFuncOrCtorDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): TFunc | undefined => {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isArrowFunction(node) ||
            ts.isMethodDeclaration(node) ||
            ts.isConstructorDeclaration(node)
        ) {
            if (isOffsetWithinNode(node, offset)) {
                return node;
            }

            return ts.forEachChild(node, visit);
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}
