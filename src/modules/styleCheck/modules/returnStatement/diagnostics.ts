import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { isIgnoredFile } from "../shared/utils";
import { enableStyleCheckReturnStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticReturnStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("return-statement");
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
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableStyleCheckReturnStatement) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsMissingBlankLineBeforeReturnStatement(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeReturnStatement(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    project?.getSourceFile(document.uri.fsPath)?.forEachDescendant(node => {
        if (!Node.isBlock(node)) {
            return;
        }

        const stmts = node.getStatements();
        if (stmts.length < 2) {
            return;
        }

        const lastStmt = stmts[stmts.length - 1];
        if (!Node.isReturnStatement(lastStmt)) {
            return;
        }

        const prevStmt = stmts[stmts.length - 2];
        const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
        const returnStartLine = document.positionAt(lastStmt.getStart()).line;

        if (returnStartLine - prevEndLine < 2) {
            const diagnostic = new vscode.Diagnostic(
                buildRangeByLineIndex(document, returnStartLine),
                "Missing blank line before return statement.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/blank-line-before-return-statement`;

            diagnostics.push(diagnostic);
        }
    });
}
