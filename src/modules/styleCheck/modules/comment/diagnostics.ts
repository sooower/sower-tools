import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findBlockNodeAtOffset } from "@/utils/typescript";
import { detectCommentType, kCommentType } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";

import { hasValidLeadingSpaceBefore } from "../../utils";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticComment() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("comment");

    extensionCtx.subscriptions.push(
        diagnosticCollection,
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
    );
}

export function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "typescript") {
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
        const currentLine = document.lineAt(lineIndex);
        if (!isCommentLine(currentLine.text)) {
            continue;
        }

        // Skip check if the comment is the first line
        if (lineIndex < 1) {
            continue;
        }

        // check if the comment is the first sub node of a block node
        const blockNode = findBlockNodeAtOffset({
            sourceFile: createSourceFileByDocument(document),
            offset: document.offsetAt(currentLine.range.start),
        });

        // Skip check if the comment is the first line of function, type, interface, class declaration
        const firstSubNode = blockNode?.statements.at(0);
        if (
            firstSubNode === undefined ||
            firstSubNode.getStart() >=
                document.offsetAt(currentLine.range.start)
        ) {
            continue;
        }

        if (isConsecutiveSingleLineComment(document, lineIndex)) {
            continue;
        }

        if (hasValidLeadingSpaceBefore(document, lineIndex)) {
            continue;
        }

        appendDiagnostic(document, lineIndex, diagnostics);
    }

    diagnosticCollection.set(document.uri, diagnostics);
}

function isCommentLine(text: string): boolean {
    return [
        /^\s*\/\/\/?/, // "///" or "//"
        /^\s*\/\*\*?/, // "/**" or "/*"
    ].some(pattern => pattern.test(text) && !isCodeWithEndComment(text));
}

function isCodeWithEndComment(text: string): boolean {
    const codeParts = text.split(/\/\/|\/\*/);
    return codeParts[0].trim().length > 0;
}

function isConsecutiveSingleLineComment(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    const currentLineCommentType = detectCommentType(
        document.lineAt(lineIndex).text
    );
    const previousLineCommentType = detectCommentType(
        document.lineAt(lineIndex - 1).text
    );

    if (
        currentLineCommentType === kCommentType.SingleLine &&
        previousLineCommentType === kCommentType.SingleLine
    ) {
        return true;
    }

    return false;
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
