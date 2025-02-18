import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

export function findAllInterfaceDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node) => {
        if (ts.isInterfaceDeclaration(node)) {
            typeDeclarationNodes.push(node);
        }
        ts.forEachChild(node, visit);
    };

    const typeDeclarationNodes: ts.InterfaceDeclaration[] = [];
    visit(sourceFile);

    return typeDeclarationNodes;
}

type TFindInterfaceDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findInterfaceDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindInterfaceDeclarationNodeAtOffsetOptions):
    | ts.InterfaceDeclaration
    | undefined {
    const visit = (node: ts.Node): ts.InterfaceDeclaration | undefined => {
        if (
            ts.isInterfaceDeclaration(node) &&
            isOffsetWithinNode(node, offset)
        ) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}
