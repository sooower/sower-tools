import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findAllBlockNodes } from "@/utils/typescript";
import { createSourceFileByDocument } from "@/utils/vscode";

import { enableStyleCheckBreakStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticBreakStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("break-statement");
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

    if (!enableStyleCheckBreakStatement) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    findAllBlockNodes(createSourceFileByDocument(document)).forEach(block => {
        appendDiagnostic(block, document, diagnostics);
    });
    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    block: ts.Block,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const stmts = block.statements;
    if (stmts.length < 2) {
        return;
    }

    const lastStmt = stmts[stmts.length - 1];
    if (!ts.isBreakStatement(lastStmt)) {
        return;
    }

    const prevStmt = stmts[stmts.length - 2];
    const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
    const breakStartLine = document.positionAt(lastStmt.getStart()).line;

    if (breakStartLine - prevEndLine < 2) {
        const range = new vscode.Range(
            document.positionAt(lastStmt.getStart()),
            document.positionAt(lastStmt.getEnd())
        );

        const diagnostic = new vscode.Diagnostic(
            range,
            "Missing blank line before break statement.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-break-statement`;

        diagnostics.push(diagnostic);
    }
}
