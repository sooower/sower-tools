import ts from "typescript";

type TFindTypeDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    typeName: string;
};

export function findTypeDeclarationNode({
    sourceFile,
    typeName,
}: TFindTypeDeclarationNodeOptions) {
    const visit = (node: ts.Node): ts.TypeAliasDeclaration | undefined => {
        if (!ts.isTypeAliasDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.name?.text === typeName) {
            return node;
        }
    };

    return visit(sourceFile);
}

export function findAllTypeDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node): ts.TypeAliasDeclaration | undefined => {
        if (!ts.isTypeAliasDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        typeDeclarationNodes.push(node);
    };

    const typeDeclarationNodes: ts.TypeAliasDeclaration[] = [];
    visit(sourceFile);

    return typeDeclarationNodes;
}

type TFindTypeDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findTypeDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindTypeDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): ts.TypeAliasDeclaration | undefined => {
        if (!ts.isTypeAliasDeclaration(node)) {
            return ts.forEachChild(node, visit);
        }

        if (node.getStart() <= offset && node.getEnd() >= offset) {
            return node;
        }
    };

    return visit(sourceFile);
}
