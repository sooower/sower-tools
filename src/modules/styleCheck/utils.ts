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
 * Check if the line is the first child of its parent, including function body, object, array, and assignment.
 * @param document The document to check.
 * @param lineIndex The index of the line to check.
 * @returns True if the line is the first child of its parent, false otherwise.
 */
export function isFirstChildOfParent(
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
            isFirstChildOfArrowFunction(lineText) ||
            isFirstChildOfObject(lineText) ||
            isFirstArrayElement(lineText) ||
            isAssignmentValue(lineText) ||
            isParameterOfFunction(lineText)
        );
    }

    return false;
}

function isFirstChildOfArrowFunction(text: string): boolean {
    const lastChars = text.slice(-2);

    return lastChars === "=>" && !text.trimStart().startsWith("//");
}

function isFirstChildOfObject(text: string): boolean {
    return text.endsWith("{") && !text.includes("//");
}

function isFirstArrayElement(text: string): boolean {
    return text.endsWith("[") && !text.includes("//");
}

function isParameterOfFunction(text: string): boolean {
    return (text.endsWith("(") || text.endsWith(",")) && !text.includes("//");
}

function isAssignmentValue(text: string): boolean {
    return text.endsWith("=") && !text.includes("//");
}
