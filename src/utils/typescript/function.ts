import ts, { ConstructorDeclaration, MethodDeclaration } from "typescript";

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

export function findFirstMethodOrCtorDeclarationNode(
    sourceFile: ts.SourceFile
) {
    const visit = (
        node: ts.Node
    ): MethodDeclaration | ConstructorDeclaration | undefined => {
        if (ts.isMethodDeclaration(node) || ts.isConstructorDeclaration(node)) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}

export function isFirstClassMember(node: TFunc): boolean {
    if (!ts.isClassDeclaration(node.parent)) {
        return false;
    }

    const classMembers = node.parent.members;

    return classMembers.length > 0 && classMembers[0] === node;
}

export function isFirstChildInParentFunction(node: ts.Node): boolean {
    const parentFunction = findContainingFunction(node);
    if (parentFunction === undefined) {
        return false;
    }

    const functionBody = getFunctionBody(parentFunction);
    if (functionBody === undefined || !ts.isBlock(functionBody)) {
        return false;
    }

    const firstStatement = functionBody.statements[0];
    if (firstStatement === undefined) {
        return false;
    }

    return node.getText() === firstStatement.getText();
}

function findContainingFunction(node: ts.Node): ts.Node | undefined {
    let current = node.parent;
    while (current !== undefined) {
        if (ts.isFunctionLike(current)) {
            return current;
        }
        current = current.parent;
    }

    return undefined;
}

function getFunctionBody(funcNode: ts.Node): ts.Node | undefined {
    return ts.isFunctionDeclaration(funcNode) ||
        ts.isFunctionExpression(funcNode)
        ? funcNode.body
        : ts.isArrowFunction(funcNode)
        ? funcNode.body
        : undefined;
}

export function isFunctionParameter(node: TFunc): boolean {
    let current = node.parent;

    while (current !== undefined) {
        // Case 1: Direct function call parameter
        if (ts.isCallExpression(current) || ts.isNewExpression(current)) {
            return current.arguments?.some(arg => arg === node) ?? false;
        }

        // TODO: Case 2: Function type parameter declaration
        // TODO: Case 3: Default parameter value

        current = current.parent;
    }

    return false;
}
