import ts from "typescript";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { createSourceFileByDocument } from "@/shared/utils/vscode";

let collection: vscode.DiagnosticCollection;

export function registerDiagnosticReturnStmtStyle() {
    collection = vscode.languages.createDiagnosticCollection("returnStmtStyle");
    extensionCtx.subscriptions.push(collection);

    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics)
    );
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
    );
}

const diagnostics: vscode.Diagnostic[] = [];

function updateDiagnostics(document: vscode.TextDocument) {
    diagnostics.length = 0; // Clear the previous diagnostics

    if (document.languageId !== "typescript") {
        return;
    }

    const visitNode = (node: ts.Node) => {
        if (ts.isBlock(node)) {
            checkBlock(node, document);
        }
        ts.forEachChild(node, visitNode);
    };

    ts.forEachChild(createSourceFileByDocument(document), visitNode);
    collection.set(document.uri, diagnostics);
}

function checkBlock(block: ts.Block, document: vscode.TextDocument) {
    const stmts = block.statements;
    if (stmts.length < 2) {
        return;
    }

    const lastStmt = stmts[stmts.length - 1];
    if (!ts.isReturnStatement(lastStmt)) {
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
        diagnostic.code = `@${extensionName}/blank-line-before-return`;

        diagnostics.push(diagnostic);
    }
}
