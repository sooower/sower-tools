import ts from "typescript";

type TFindTypeDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    typeName: string;
};

export function findTypeDeclarationNode({
    sourceFile,
    typeName,
}: TFindTypeDeclarationNodeOptions) {
    let typeDeclarationNode:
        | ts.TypeAliasDeclaration
        | ts.InterfaceDeclaration
        | ts.ClassDeclaration
        | undefined;

    ts.forEachChild(sourceFile, visit);

    function visit(node: ts.Node) {
        if (
            ts.isTypeAliasDeclaration(node) &&
            node.name !== undefined &&
            node.name.text === typeName
        ) {
            typeDeclarationNode = node;
        } else {
            ts.forEachChild(node, visit);
        }
    }

    return typeDeclarationNode;
}

type TFindFuncDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    funcName: string;
};

export function findFuncDeclarationNode({
    sourceFile,
    funcName,
}: TFindFuncDeclarationNodeOptions) {
    let funcNode: ts.Node | undefined;

    ts.forEachChild(sourceFile, visit);

    function visit(node: ts.Node) {
        if (
            (ts.isFunctionDeclaration(node) || ts.isArrowFunction(node)) &&
            node.name !== undefined &&
            node.name.text === funcName
        ) {
            funcNode = node;
        }
    }

    return funcNode;
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
    ): ts.FunctionDeclaration | ts.ArrowFunction | undefined {
        if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
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
