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

type TFindFuncDeclarationNodeAtPositionOptions = {
    sourceFile: ts.SourceFile;
    position: ts.LineAndCharacter;
};

export function findFuncDeclarationNodeAtPosition({
    sourceFile,
    position,
}: TFindFuncDeclarationNodeAtPositionOptions) {
    function visit(
        node: ts.Node
    ): ts.FunctionDeclaration | ts.ArrowFunction | undefined {
        if (!ts.isFunctionDeclaration(node) && !ts.isArrowFunction(node)) {
            return ts.forEachChild(node, visit);
        }

        const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
        );
        if (line === position.line) {
            return node;
        }
    }

    return visit(sourceFile);
}

type TFindEnumDeclarationNodeAtPositionOptions = {
    sourceFile: ts.SourceFile;
    position: ts.LineAndCharacter;
};

export function findEnumDeclarationNodeAtPosition({
    sourceFile,
    position,
}: TFindEnumDeclarationNodeAtPositionOptions) {
    function find(node: ts.Node): ts.EnumDeclaration | undefined {
        if (!ts.isEnumDeclaration(node)) {
            return ts.forEachChild(node, find);
        }

        const { line } = sourceFile.getLineAndCharacterOfPosition(
            node.getStart()
        );

        if (line === position.line) {
            return node;
        }
    }

    return find(sourceFile);
}
