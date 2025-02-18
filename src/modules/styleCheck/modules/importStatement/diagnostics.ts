import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findLastImportStatementNode } from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";

import { hasValidLeadingSpaceAfter } from "../../utils";
import { enableStyleCheckImportStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticImportStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("import-statement");

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

    if (!enableStyleCheckImportStatement) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    const lastImportStatementNode = findLastImportStatementNode(
        createSourceFileByDocument(document)
    );
    appendDiagnostic(lastImportStatementNode, document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    node: ts.ImportDeclaration | undefined,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    // Skip if there is no import statement
    if (node === undefined) {
        return;
    }

    const nodeEndLine = document.positionAt(node.getEnd()).line;

    // Skip if the last import statement is the last line of the file
    if (nodeEndLine === document.lineCount - 1) {
        return;
    }

    if (hasValidLeadingSpaceAfter(document, nodeEndLine)) {
        return;
    }

    // Skip if the next line is a comment
    const nextLine = document.lineAt(nodeEndLine + 1);
    if (detectCommentKind(nextLine.text) !== null) {
        return;
    }

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
}
