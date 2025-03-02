import path from "node:path";

import { Node } from "ts-morph";

import { vscode } from "@/core";
import { CommonUtils } from "@utils/common";

import { prettierFormatText } from "../common";
import { buildRangeByOffsets } from "./range";

export enum ELanguageId {
    TypeScript = "typescript",
    Markdown = "markdown",
}

export function getTrimmedLineText(
    document: vscode.TextDocument,
    lineIndex: number
) {
    return document.lineAt(lineIndex).text.trim();
}

export function isTypeScriptFile(filePath: string): boolean;
export function isTypeScriptFile(document: vscode.TextDocument): boolean;
export function isTypeScriptFile(arg: string | vscode.TextDocument): boolean {
    if (CommonUtils.isString(arg)) {
        return path.extname(arg).toLowerCase() === ".ts";
    }

    return arg.languageId === ELanguageId.TypeScript;
}

export function isMarkdownFile(filePath: string): boolean;
export function isMarkdownFile(document: vscode.TextDocument): boolean;
export function isMarkdownFile(arg: string | vscode.TextDocument): boolean {
    if (CommonUtils.isString(arg)) {
        return path.extname(arg).toLowerCase() === ".md";
    }

    return arg.languageId === ELanguageId.Markdown;
}

/**
 * Format the document using 'prettier'.
 *
 * @param document - The document to format.
 */
export async function formatDocument(document: vscode.TextDocument) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    workspaceEdit.replace(
        document.uri,
        buildRangeByOffsets(document, 0, document.getText().length),
        prettierFormatText(document.getText())
    );
    await vscode.workspace.applyEdit(workspaceEdit);
}

export function isNodeInRange(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection,
    node: Node
) {
    return (
        node.getStart() <= document.offsetAt(range.start) &&
        node.getEnd() >= document.offsetAt(range.end)
    );
}
