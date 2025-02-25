import { Node } from "ts-morph";
import ts from "typescript";

import { vscode } from "@/core";

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

export function buildRangeByNode(
    document: vscode.TextDocument,
    node: ts.Node | Node
) {
    return new vscode.Range(
        document.positionAt(node.getStart()),
        document.positionAt(node.getEnd())
    );
}

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
