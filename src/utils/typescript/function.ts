import ts, { ConstructorDeclaration, MethodDeclaration } from "typescript";

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
            !ts.isFunctionDeclaration(node) &&
            !ts.isArrowFunction(node) &&
            !ts.isMethodDeclaration(node)
        ) {
            return ts.forEachChild(node, visit);
        }

        if (node.name?.getText() === funcName) {
            return node;
        }
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
            !ts.isFunctionDeclaration(node) &&
            !ts.isArrowFunction(node) &&
            !ts.isMethodDeclaration(node) &&
            !ts.isConstructorDeclaration(node)
        ) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    };

    return visit(sourceFile);
}

export function findAllFuncOrCtorDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node): TFunc | undefined => {
        if (
            !ts.isFunctionDeclaration(node) &&
            !ts.isConstructorDeclaration(node) &&
            !ts.isArrowFunction(node) &&
            !ts.isMethodDeclaration(node)
        ) {
            return ts.forEachChild(node, visit);
        }

        funcOrCtorDeclarationNodes.push(node);
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
        if (
            !ts.isMethodDeclaration(node) &&
            !ts.isConstructorDeclaration(node)
        ) {
            return ts.forEachChild(node, visit);
        }

        return node;
    };

    return visit(sourceFile);
}
