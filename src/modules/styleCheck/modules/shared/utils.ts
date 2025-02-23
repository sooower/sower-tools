import path from "path";

import ignore from "ignore";

import { fs, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { readFile } from "@utils/fs";

import { ignoreCompatibleConfigFilenames, ignorePatterns } from "./configs";

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
    const ignoreManager = ignore();

    // TODO: reload ignore patterns every time when calling this function now,
    // need to optimize it only when the ignore patterns are changed, like
    // config file or configuration item is changed
    loadIgnorePatterns(ignoreManager);

    const relativePath = path.relative(
        getWorkspaceFolderPath(),
        document.uri.fsPath
    );

    const res = ignoreManager.ignores(relativePath);

    return res;
}

function loadIgnorePatterns(ignoreManager: ignore.Ignore) {
    // Read configured glob patterns
    ignoreManager.add(ignorePatterns);

    // Read patterns from compatible config files
    for (const filename of ignoreCompatibleConfigFilenames) {
        const filePath = path.join(getWorkspaceFolderPath(), filename);
        if (!fs.existsSync(filePath)) {
            continue;
        }

        ignoreManager.add(readFile(filePath).split("\n"));
    }
}
