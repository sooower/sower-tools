import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { detectCommentKind, kCommentKind } from "@/utils/typescript/comment";

import { hasValidLeadingSpaceBefore, isFirstChildOfParent } from "../../utils";
import { enableStyleCheckComment } from "./configs";

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

    const diagnostics: vscode.Diagnostic[] = [];

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const currentLine = document.lineAt(lineIndex);
        if (!isCommentLine(currentLine.text)) {
            continue;
        }

        // Skip if the comment is the first line of the document
        if (lineIndex < 1) {
            continue;
        }

        if (isConsecutiveSingleLineComment(document, lineIndex)) {
            continue;
        }

        if (hasValidLeadingSpaceBefore(document, lineIndex)) {
            continue;
        }

        if (isFirstChildOfParent(document, lineIndex)) {
            continue;
        }

        console.log("appendDiagnostic: line:", lineIndex + 1);
        appendDiagnostic(document, lineIndex, diagnostics);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    document: vscode.TextDocument,
    lineNumber: number,
    diagnostics: vscode.Diagnostic[]
) {
    const line = document.lineAt(lineNumber);

    const firstVisibleCharIndex = line.firstNonWhitespaceCharacterIndex;
    if (firstVisibleCharIndex === -1) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
            new vscode.Position(line.lineNumber, firstVisibleCharIndex),
            line.range.end
        ),
        "Missing a blank line before the comment",
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
    return /^\s*(\/\/|\/\*)/.test(text.trimStart());
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
        currentLineCommentKind === kCommentKind.SingleLine &&
        previousLineCommentKind === kCommentKind.SingleLine
    ) {
        return true;
    }

    return false;
}
