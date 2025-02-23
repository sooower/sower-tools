import ts from "typescript";

import { isOffsetWithinNode } from "./utils";

export function findAllBlockNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node) => {
        if (ts.isBlock(node)) {
            blockNodes.push(node);
        }
        ts.forEachChild(node, visit);
    };

    const blockNodes: ts.Block[] = [];
    visit(sourceFile);

    return blockNodes;
}

type TFindAllBlockNodesAtOffsetOptions = {
    sourceFile: ts.SourceFile;
    offset: number;
};

export function findAllBlockNodesAtOffset({
    sourceFile,
    offset,
}: TFindAllBlockNodesAtOffsetOptions) {
    const visit = (node: ts.Node): ts.Block | undefined => {
        if (ts.isBlock(node)) {
            if (isOffsetWithinNode(node, offset)) {
                blockNodes.push(node);
            }

            return ts.forEachChild(node, visit);
        }

        return ts.forEachChild(node, visit);
    };

    const blockNodes: ts.Block[] = [];
    visit(sourceFile);

    return blockNodes;
}

export function findAllTryBlockNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node) => {
        if (ts.isTryStatement(node)) {
            blockNodes.push(node.tryBlock);
        }
        ts.forEachChild(node, visit);
    };

    const blockNodes: ts.Block[] = [];
    visit(sourceFile);

    return blockNodes;
}
