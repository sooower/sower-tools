import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

const kCommentType = {
    SingleLine: "//",
    MultiLineStart: "/*",
    MultiLineEnd: "*/",
    DocComment: "/**",
};

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticCommentStyle() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("comment-style");

    extensionCtx.subscriptions.push(diagnosticCollection);
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics)
    );
    extensionCtx.subscriptions.push(
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

        if (lineIndex < 1) {
            continue;
        }

        if (!isValidCommentSpacing(document, lineIndex)) {
            appendDiagnostic(document, lineIndex, diagnostics);
        }
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

function isValidCommentSpacing(
    document: vscode.TextDocument,
    lineIndex: number
): boolean {
    const currentLineCommentType = detectCommentType(
        document.lineAt(lineIndex).text
    );
    const previousLineCommentType = detectCommentType(
        document.lineAt(lineIndex - 1).text
    );

    // Skip check if consecutive single line comment
    if (
        currentLineCommentType === kCommentType.SingleLine &&
        previousLineCommentType === kCommentType.SingleLine
    ) {
        return true;
    }

    return hasValidLeadingSpace(document, lineIndex);
}

function detectCommentType(text: string): string | null {
    const trimmed = text.trim();

    if (trimmed.startsWith(kCommentType.DocComment)) {
        return kCommentType.DocComment;
    }

    if (trimmed.startsWith(kCommentType.SingleLine)) {
        return kCommentType.SingleLine;
    }

    if (trimmed.includes(kCommentType.MultiLineEnd)) {
        return kCommentType.MultiLineEnd;
    }

    if (trimmed.startsWith(kCommentType.MultiLineStart)) {
        return kCommentType.MultiLineStart;
    }

    return null;
}

function hasValidLeadingSpace(
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
        "Need a blank line before the comment",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-comment`;

    diagnostics.push(diagnostic);
}
