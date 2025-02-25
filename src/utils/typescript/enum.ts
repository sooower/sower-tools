import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

type TFindEnumDeclarationNodeAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findEnumDeclarationNodeAtOffset({
    sourceFile,
    offset,
}: TFindEnumDeclarationNodeAtOffsetOptions) {
    const visit = (node: ts.Node): ts.EnumDeclaration | undefined => {
        if (ts.isEnumDeclaration(node) && isOffsetWithinNode(node, offset)) {
            return node;
        }

        return ts.forEachChild(node, visit);
    };

    return visit(sourceFile);
}
