import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findLastImportStatementNode } from "@/utils/typescript";
import { detectCommentType } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";

import { hasValidLeadingSpaceAfter } from "../../utils";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticImportStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("import-statement");

    extensionCtx.subscriptions.push(
        diagnosticCollection,
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
    );
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "typescript") {
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    const lastImportStatementNode = findLastImportStatementNode(
        createSourceFileByDocument(document)
    );

    // Skip if there is no import statement
    if (lastImportStatementNode === undefined) {
        return;
    }

    const lastImportStatementNodeEndLine = document.positionAt(
        lastImportStatementNode.getEnd()
    ).line;

    // Skip if the last import statement is the last line of the file
    if (lastImportStatementNodeEndLine === document.lineCount - 1) {
        return;
    }

    if (hasValidLeadingSpaceAfter(document, lastImportStatementNodeEndLine)) {
        return;
    }

    // Skip if the next line is a comment
    const nextLine = document.lineAt(lastImportStatementNodeEndLine + 1);
    if (detectCommentType(nextLine.text) !== null) {
        return;
    }

    appendDiagnostic(lastImportStatementNode, document, diagnostics);
}

function appendDiagnostic(
    node: ts.ImportDeclaration,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const importNodeEndPos = node.getEnd();
    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
            document.positionAt(importNodeEndPos),
            document.positionAt(importNodeEndPos)
        ),
        "Missing a blank line after the last import statement",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-after-last-import-statement`;

    diagnostics.push(diagnostic);

    diagnosticCollection.set(document.uri, diagnostics);
}
