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

export function findAllFuncOrCtorDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node) => {
        if (
            ts.isFunctionDeclaration(node) ||
            ts.isConstructorDeclaration(node) ||
            ts.isArrowFunction(node) ||
            ts.isMethodDeclaration(node)
        ) {
            funcOrCtorDeclarationNodes.push(node);
        }
        ts.forEachChild(node, visit);
    };

    const funcOrCtorDeclarationNodes: TFunc[] = [];
    visit(sourceFile);

    return funcOrCtorDeclarationNodes;
}

export function isFunctionParameter(node: TFunc): boolean {
    let current = node.parent;

    while (current !== undefined) {
        // Case 1: Direct function call parameter
        if (ts.isCallExpression(current) || ts.isNewExpression(current)) {
            return current.arguments?.some(arg => arg === node) ?? false;
        }

        current = current.parent;
    }

    return false;
}
