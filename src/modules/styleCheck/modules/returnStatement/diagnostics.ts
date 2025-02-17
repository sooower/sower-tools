import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findAllBlockNodes } from "@/utils/typescript";
import { createSourceFileByDocument } from "@/utils/vscode";

let collection: vscode.DiagnosticCollection;

export function registerDiagnosticReturnStatement() {
    collection =
        vscode.languages.createDiagnosticCollection("return-statement");
    extensionCtx.subscriptions.push(
        collection,
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
    );
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "typescript") {
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];
    findAllBlockNodes(createSourceFileByDocument(document)).forEach(block => {
        appendDiagnostic(block, document, diagnostics);
    });
    collection.set(document.uri, diagnostics);
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
    if (!ts.isReturnStatement(lastStmt)) {
        // Check last statement is a return statement recursively.
        ts.forEachChild(lastStmt, child => {
            if (ts.isBlock(child)) {
                return appendDiagnostic(child, document, diagnostics);
            }
        });

        return;
    }

    const prevStmt = stmts[stmts.length - 2];
    const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
    const returnStartLine = document.positionAt(lastStmt.getStart()).line;

    if (returnStartLine - prevEndLine < 2) {
        const range = new vscode.Range(
            document.positionAt(lastStmt.getStart()),
            document.positionAt(lastStmt.getEnd())
        );

        const diagnostic = new vscode.Diagnostic(
            range,
            "Missing blank line before return statement.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-return-statement`;

        diagnostics.push(diagnostic);
    }
}
