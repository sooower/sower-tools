import { vscode } from "@/core";

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
 * Check if the line is the start of a function body or arrow function.
 * @param document The document to check
 * @param lineIndex The index of the current line
 * @returns True if the line is the start of a function body or arrow function, false otherwise
 */
export function isBodyStartLine(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    // Scan from the line before the comment line upwards
    for (let i = lineIndex - 1; i >= 0; i--) {
        const lineText = document.lineAt(i).text;

        // Skip empty lines
        if (!/\S/.test(lineText)) {
            continue;
        }

        const trimmed = lineText.trimEnd();

        return isFunctionBodyEnd(trimmed) || isInArrowFunction(trimmed);
    }

    return false;
}

/**
 * Check if the line is a function body end, by checking if it ends with `{`.
 * @param text The text to check
 * @returns True if the line is a function body end, false otherwise
 */
function isFunctionBodyEnd(text: string): boolean {
    return text.endsWith("{") && !text.includes("//");
}

/**
 * Check if the line is in an arrow function, by checking if it ends with `=>`.
 * @param text The text to check
 * @returns True if the line is in an arrow function, false otherwise
 */
function isInArrowFunction(text: string): boolean {
    const lastChars = text.slice(-2);

    return lastChars === "=>" && !text.trimStart().startsWith("//");
}
