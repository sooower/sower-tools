import ts from "typescript";

/**
 * Check if the offset position is within the node.
 *
 * @param node - The node to check.
 * @param offset - The offset number to check.
 * @returns True if the offset position is within the node, false otherwise.
 */
export function isOffsetWithinNode(node: ts.Node, offset: number) {
    return node.getStart() <= offset && node.getEnd() >= offset;
}
