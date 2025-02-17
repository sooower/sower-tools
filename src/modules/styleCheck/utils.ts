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
        if (currentLine.isEmptyOrWhitespace) {
            blankCount++;
            currentLineIndex--;
        } else {
            break;
        }
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
