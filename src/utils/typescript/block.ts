import ts from "typescript";

export function findAllBlockNodes(sourceFile: ts.SourceFile) {
    const visit = (node: ts.Node): ts.Block | undefined => {
        if (!ts.isBlock(node)) {
            return ts.forEachChild(node, visit);
        }

        blockNodes.push(node);
    };

    const blockNodes: ts.Block[] = [];
    visit(sourceFile);

    return blockNodes;
}
