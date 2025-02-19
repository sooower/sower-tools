import ts from "typescript";

import { hasValidLeadingSpaceAfter } from "@/modules/styleCheck/utils";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findLastImportStatementNode } from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";
import { buildRangeByNode } from "@/utils/vscode/range";

import { enableStyleCheckImportStatement } from "../configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticBlankLineAfterLastImportStatement() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "blank-line-after-last-import-statement"
    );

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

    const nodeEndLineIndex = document.positionAt(node.getEnd()).line;

    // Skip if the last import statement is the last line of the file
    if (nodeEndLineIndex === document.lineCount - 1) {
        return;
    }

    if (hasValidLeadingSpaceAfter(document, nodeEndLineIndex)) {
        return;
    }

    // Skip if the next line is a comment
    const nextLine = document.lineAt(nodeEndLineIndex + 1);
    if (detectCommentKind(nextLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        buildRangeByNode(document, node),
        "Missing a blank line after the last import statement.",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-after-last-import-statement`;

    diagnostics.push(diagnostic);
}
