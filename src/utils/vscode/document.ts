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

/**
 * Get the trimmed line text of the given document and line index.
 * @param document - The document to get the trimmed line text.
 * @param lineIndex - The line index(zero-based) to get the trimmed line text.
 * @returns The trimmed line text of the given document and line index.
 */
export function getTrimmedLineText(
    document: vscode.TextDocument,
    lineIndex: number
) {
    return document.lineAt(lineIndex).text.trim();
}

/**
 * Check if the given file path or document is a TypeScript file.
 * @param filePath - The file path to check if it is a TypeScript file.
 * @returns True if the given file path is a TypeScript file, false otherwise.
 */
export function isTypeScriptFile(filePath: string): boolean;
/**
 * Check if the given document is a TypeScript file.
 * @param document - The document to check if it is a TypeScript file.
 * @returns True if the given document is a TypeScript file, false otherwise.
 */
export function isTypeScriptFile(document: vscode.TextDocument): boolean;
export function isTypeScriptFile(arg: string | vscode.TextDocument): boolean {
    if (CommonUtils.isString(arg)) {
        return path.extname(arg).toLowerCase() === ".ts";
    }

    return arg.languageId === ELanguageId.TypeScript;
}

/**
 * Check if the given file path or document is a Markdown file.
 * @param filePath - The file path to check if it is a Markdown file.
 * @returns True if the given file path is a Markdown file, false otherwise.
 */
export function isMarkdownFile(filePath: string): boolean;
/**
 * Check if the given document is a Markdown file.
 * @param document - The document to check if it is a Markdown file.
 * @returns True if the given document is a Markdown file, false otherwise.
 */
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

/**
 * Check if the given node is in the given range.
 * @param document - The document to check if the given node is in the given range.
 * @param range - The range to check if the given node is in the given range.
 * @param node - The node to check if it is in the given range.
 * @returns `true` if the given node is in the given range, `false` otherwise.
 */
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
