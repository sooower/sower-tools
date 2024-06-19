import ts from "typescript";

type TFindTypeDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    typeName: string;
};

export function findTypeDeclarationNode({
    sourceFile,
    typeName,
}: TFindTypeDeclarationNodeOptions) {
    function visit(node: ts.Node): ts.TypeAliasDeclaration | undefined {
        if (!ts.isTypeAliasDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.name?.text === typeName) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindFuncDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    funcName: string;
};

export function findFuncDeclarationNode({
    sourceFile,
    funcName,
}: TFindFuncDeclarationNodeOptions) {
    function visit(
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
            return ts.forEachChild(node, visit);
        }

        if (node.name?.getText() === funcName) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindFuncDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findFuncDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindFuncDeclarationNodeAtOffsetOptions) {
    function visit(
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
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindEnumDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    enumName: string;
};

export function findEnumDeclarationNode({
    sourceFile,
    enumName,
}: TFindEnumDeclarationNodeOptions) {
    function visit(node: ts.Node): ts.EnumDeclaration | undefined {
        if (!ts.isEnumDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.name?.text === enumName) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindEnumDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findEnumDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindEnumDeclarationNodeAtOffsetOptions) {
    function visit(node: ts.Node): ts.EnumDeclaration | undefined {
        if (!ts.isEnumDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindVariableDeclarationNodeOptions = {
    sourceFile: ts.Node;
    varName: string;
};

export function findVariableDeclarationNode({
    sourceFile,
    varName,
}: TFindVariableDeclarationNodeOptions) {
    function visit(node: ts.Node): ts.VariableDeclaration | undefined {
        if (!ts.isVariableDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.name.getText() === varName) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindVariableDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findVariableDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindVariableDeclarationNodeAtOffsetOptions) {
    function visit(node: ts.Node): ts.VariableDeclaration | undefined {
        if (!ts.isVariableDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    }

    return visit(sourceFile);
}
