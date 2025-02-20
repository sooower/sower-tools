import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findAllBlockNodes } from "@/utils/typescript";
import { createSourceFileByDocument } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { isIgnoredFile } from "../../utils";
import { enableStyleCheckContinueStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticContinueStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("continue-statement");
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

    if (!enableStyleCheckContinueStatement) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
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
    if (!ts.isContinueStatement(lastStmt)) {
        return;
    }

    const prevStmt = stmts[stmts.length - 2];
    const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
    const continueStartLine = document.positionAt(lastStmt.getStart()).line;

    if (continueStartLine - prevEndLine < 2) {
        const diagnostic = new vscode.Diagnostic(
            buildRangeByLineIndex(document, continueStartLine),
            "Missing blank line before continue statement.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-continue-statement`;

        diagnostics.push(diagnostic);
    }
}
