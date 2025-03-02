import path from "node:path";

import { vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { ignoreManager } from "./configs";

/**
 * Check if the line has a valid leading space before it.
 * @param document The document to check.
 * @param lineIndex The index of the line to check.
 * @returns True if the line has a valid leading space before it, false otherwise.
 */
export function hasValidLeadingSpaceBefore(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    let blankCount = 0;
    let currentLineIndex = lineIndex - 1;

    // Scan backwards until non-empty line
    while (currentLineIndex >= 0) {
        const currentLine = document.lineAt(currentLineIndex);
        if (!currentLine.isEmptyOrWhitespace) {
            break;
        }

        blankCount++;
        currentLineIndex--;
    }

    return blankCount >= 1;
}

/**
 * Check if the line has a valid leading space after it.
 * @param document The document to check.
 * @param lineIndex The index of the line to check.
 * @returns True if the line has a valid leading space after it, false otherwise.
 */
export function hasValidLeadingSpaceAfter(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    let blankCount = 0;
    let currentLineIndex = lineIndex + 1;

    // Scan forwards until non-empty line
    while (currentLineIndex < document.lineCount) {
        const currentLine = document.lineAt(currentLineIndex);
        if (currentLine.isEmptyOrWhitespace) {
            blankCount++;
            currentLineIndex++;
        } else {
            break;
        }
    }

    return blankCount >= 1;
}

/**
 * Check if the line is the first line of its parent, including function body, object, array, and assignment.
 * @param document The document to check.
 * @param lineIndex The index of the line to check.
 * @returns True if the line is the first line of its parent, false otherwise.
 */
export function isFirstLineOfParent(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    // Scan from the line before the comment line upwards
    for (let i = lineIndex - 1; i >= 0; i--) {
        const lineText = document.lineAt(i).text.trimEnd();

        // Skip empty lines
        if (!/\S/.test(lineText)) {
            continue;
        }

        return (
            isFirstLineOfArrowFunctionBody(lineText) ||
            isFirstLineOfObjectBody(lineText) ||
            isFirstLineOfArrayBody(lineText) ||
            isAssignmentValue(lineText) ||
            isFirstParameterOfFunction(lineText)
        );
    }

    return false;
}

function isFirstLineOfArrowFunctionBody(text: string): boolean {
    const lastChars = text.slice(-2);

    return lastChars === "=>" && !text.trimStart().startsWith("//");
}

function isFirstLineOfObjectBody(text: string): boolean {
    return text.endsWith("{") && !text.includes("//");
}

function isFirstLineOfArrayBody(text: string): boolean {
    return text.endsWith("[") && !text.includes("//");
}

function isFirstParameterOfFunction(text: string): boolean {
    return (text.endsWith("(") || text.endsWith(",")) && !text.includes("//");
}

function isAssignmentValue(text: string): boolean {
    return text.endsWith("=") && !text.includes("//");
}

/**
 * Check if the line is the last line of its parent, including function body, object, array.
 * @param document The document to check.
 * @param lineIndex The index of the line to check.
 * @returns True if the line is the last line of its parent, false otherwise.
 */
export function isLastLineOfParent(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    for (let i = lineIndex + 1; i < document.lineCount; i++) {
        const lineText = document.lineAt(i).text.trimStart();

        if (!/\S/.test(lineText)) {
            continue;
        }

        return (
            isLastLineOfObjectBody(lineText) ||
            isLastLineOfArrayBody(lineText) ||
            isLastParameterOfFunction(lineText)
        );
    }

    return false;
}

function isLastLineOfObjectBody(text: string): boolean {
    return text.startsWith("}") && !text.includes("//");
}

function isLastLineOfArrayBody(text: string): boolean {
    return text.startsWith("]") && !text.includes("//");
}

function isLastParameterOfFunction(text: string): boolean {
    return text.startsWith(")") && !text.includes("//");
}

export function isIgnoredFile(document: vscode.TextDocument): boolean {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return false;
    }

    const relativePath = path.relative(
        workspaceFolderPath,
        document.uri.fsPath
    );

    CommonUtils.assert(
        !relativePath.startsWith("../"),
        `Invalid relative path: "${relativePath}".`
    );

    return ignoreManager.ignores(relativePath);
}

export function isDiffView(document: vscode.TextDocument) {
    return ["git", "git-index", "vscode-scm", "gitlens"].includes(
        document.uri.scheme
    );
}

export enum ECommentKind {
    SingleLine = "//",
    MultiLineStart = "/*",
    MultiLineEnd = "*/",
    DocCommentStart = "/**",
}

export function detectCommentKind(text: string): ECommentKind | null {
    const trimmed = text.trim();

    if (trimmed.startsWith(ECommentKind.DocCommentStart)) {
        return ECommentKind.DocCommentStart;
    }

    if (trimmed.startsWith(ECommentKind.SingleLine)) {
        return ECommentKind.SingleLine;
    }

    if (trimmed.startsWith(ECommentKind.MultiLineStart)) {
        return ECommentKind.MultiLineStart;
    }

    if (trimmed.includes(ECommentKind.MultiLineEnd)) {
        return ECommentKind.MultiLineEnd;
    }

    return null;
}
