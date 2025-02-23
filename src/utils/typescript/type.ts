import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

type TFindTypeDeclarationNodeOptions = {
    sourceFile: ts.SourceFile;
    typeName: string;
};

export function findTypeDeclarationNode({
    sourceFile,
    typeName,
}: TFindTypeDeclarationNodeOptions) {
    const visit = (node: ts.Node): ts.TypeAliasDeclaration | undefined => {
        if (ts.isTypeAliasDeclaration(node) && node.name.text === typeName) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}

export function findAllTypeDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node) => {
        if (ts.isTypeAliasDeclaration(node)) {
            typeDeclarationNodes.push(node);
        }
        ts.forEachChild(node, visit);
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
        if (
            ts.isTypeAliasDeclaration(node) &&
            isOffsetWithinNode(node, offset)
        ) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}
