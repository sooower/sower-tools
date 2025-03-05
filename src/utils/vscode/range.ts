import { Node } from "ts-morph";

import { vscode } from "@/core";

/**
 * Build a range by the given document and start and end offsets.
 * @param document - The document to build the range.
 * @param startOffset - The start offset of the range.
 * @param endOffset - The end offset of the range.
 * @returns The range built by the given document and start and end offsets.
 */
export function buildRangeByOffsets(
    document: vscode.TextDocument,
    startOffset: number,
    endOffset: number
) {
    return new vscode.Range(
        document.positionAt(startOffset),
        document.positionAt(endOffset)
    );
}

/**
 * Build a range by the given document and node.
 * @param document - The document to build the range.
 * @param node - The node to build the range.
 * @returns The range built by the given document and node.
 */
export function buildRangeByNode(document: vscode.TextDocument, node: Node) {
    return new vscode.Range(
        document.positionAt(node.getStart()),
        document.positionAt(node.getEnd())
    );
}

/**
 * Build a range by the given document and line index.
 * @param document - The document to build the range.
 * @param lineIndex - The line index(zero-based) to build the range.
 * @returns The range built by the given document and line index.
 */
export function buildRangeByLineIndex(
    document: vscode.TextDocument,
    lineIndex: number
) {
    const textLine = document.lineAt(lineIndex);
    const firstVisibleCharIndex = textLine.firstNonWhitespaceCharacterIndex;

    return new vscode.Range(
        new vscode.Position(
            lineIndex,
            firstVisibleCharIndex === -1 ? 0 : firstVisibleCharIndex
        ),
        textLine.range.end
    );
}
