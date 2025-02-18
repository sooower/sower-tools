import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

type TFindClassDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findClassDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindClassDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): ts.ClassDeclaration | undefined => {
        if (ts.isClassDeclaration(node)) {
            if (isOffsetWithinNode(node, offset)) {
                return node;
            }

            return ts.forEachChild(node, visit);
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}

export function findAllClassDeclarationNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node) => {
        if (ts.isClassDeclaration(node)) {
            classDeclarationNodes.push(node);
        }
        ts.forEachChild(node, visit);
    };

    const classDeclarationNodes: ts.ClassDeclaration[] = [];
    visit(sourceFile);

    return classDeclarationNodes;
}
