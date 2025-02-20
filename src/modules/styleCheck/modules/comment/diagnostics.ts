import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { detectCommentKind, ECommentKind } from "@/utils/typescript/comment";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
    hasValidLeadingSpaceBefore,
    isFirstLineOfParent,
    isIgnoredFile,
    isLastLineOfParent,
} from "../../utils";
import { enableStyleCheckComment, skipCheckCharacter } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticComment() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("comment");

    extensionCtx.subscriptions.push(
        diagnosticCollection,
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics),
        vscode.window.onDidChangeActiveTextEditor(e => {
            if (e?.document !== undefined) {
                updateDiagnostics(e.document);
            }
        })
    );
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "typescript") {
        return;
    }

    if (!enableStyleCheckComment) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const currentLine = document.lineAt(lineIndex);
        if (!isCommentLine(currentLine.text.trim())) {
            continue;
        }

        // Skip if the comment is the first line of the document
        if (lineIndex < 1) {
            continue;
        }

        // Skip if the comment starts with skip check character
        if (startsWithSkipCheckCharacter(currentLine.text)) {
            continue;
        }

        if (startsOrEndsWithClosedMultiLinesComment(currentLine.text)) {
            continue;
        }

        if (isConsecutiveSingleLineComment(document, lineIndex)) {
            continue;
        }

        if (hasValidLeadingSpaceBefore(document, lineIndex)) {
            continue;
        }

        if (isFirstLineOfParent(document, lineIndex)) {
            continue;
        }

        if (isLastLineOfParent(document, lineIndex)) {
            continue;
        }

        appendDiagnostic(document, lineIndex, diagnostics);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    document: vscode.TextDocument,
    lineIndex: number,
    diagnostics: vscode.Diagnostic[]
) {
    const diagnostic = new vscode.Diagnostic(
        buildRangeByLineIndex(document, lineIndex),
        "Missing a blank line before the comment.",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-comment`;

    diagnostics.push(diagnostic);
}

/**
 * Check if the line is a comment line, by checking if it starts with `//` or `/*`.
 * @param text The text to check
 * @returns True if the line is a comment line, false otherwise
 */
function isCommentLine(text: string): boolean {
    return /^(\/\/|\/\*)/.test(text.trimStart());
}

/**
 * Check if the current line and the previous line are consecutive single line comments.
 * @param document The document to check
 * @param lineIndex The index of the current line
 * @returns True if the current line and the previous line are consecutive single line comments, false otherwise
 */
function isConsecutiveSingleLineComment(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    const currentLineCommentKind = detectCommentKind(
        document.lineAt(lineIndex).text
    );
    const previousLineCommentKind = detectCommentKind(
        document.lineAt(lineIndex - 1).text
    );

    if (
        currentLineCommentKind === ECommentKind.SingleLine &&
        previousLineCommentKind === ECommentKind.SingleLine
    ) {
        return true;
    }

    return false;
}

function startsWithSkipCheckCharacter(text: string): boolean {
    // There need an additional backslash '\' to prevent escape,
    // so when the skip check character is '?', the original regex is:
    // /^(\/\/|\/\*\\s*)\?/
    return new RegExp(`^(\\/\\/|\\/\\*\\*?\\s*)\\${skipCheckCharacter}`).test(
        text.trimStart()
    );
}

function startsOrEndsWithClosedMultiLinesComment(text: string): boolean {
    const trimmedText = text.trim();
    const multiLineStartIndex = trimmedText.indexOf(
        ECommentKind.MultiLineStart
    );
    const multiLineEndIndex = trimmedText.indexOf(ECommentKind.MultiLineEnd);

    if (multiLineStartIndex === -1 || multiLineEndIndex === -1) {
        return false;
    }

    if (
        multiLineStartIndex === 0 &&
        multiLineEndIndex === trimmedText.length - 2
    ) {
        // Means the whole text is a multi-line comment
        return false;
    }

    return true;
}
