import ts from "typescript";

export function findTypeDeclarationNode(
    sourceFile: ts.SourceFile,
    typeName: string
) {
    let typeDeclarationNode:
        | ts.TypeAliasDeclaration
        | ts.InterfaceDeclaration
        | ts.ClassDeclaration
        | undefined;

    ts.forEachChild(sourceFile, visit);

    function visit(node: ts.Node) {
        if (
            (ts.isTypeAliasDeclaration(node) ||
                ts.isInterfaceDeclaration(node) ||
                ts.isClassDeclaration(node)) &&
            node.name?.text === typeName
        ) {
            typeDeclarationNode = node;
        } else {
            ts.forEachChild(node, visit);
        }
    }

    return typeDeclarationNode;
}

export function findFuncDeclarationNode(
    sourceFile: ts.SourceFile,
    funcName: string
) {
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

export function findFuncDeclarationNodeAtPosition(
    sourceFile: ts.SourceFile,
    position: ts.LineAndCharacter
) {
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

export function findEnumDeclarationNodeAtPosition(
    sourceFile: ts.SourceFile,
    position: ts.LineAndCharacter
) {
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
