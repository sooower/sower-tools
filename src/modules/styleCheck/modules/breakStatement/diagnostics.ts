import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { buildRangeByLineIndex, isTypeScriptFile } from "@/utils/vscode";

import { debouncedStyleCheck } from "../../utils";
import { isDiffView, isIgnoredFile } from "../shared/utils";
import { enableStyleCheckBreakStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticBreakStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("break-statement");
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableStyleCheckBreakStatement) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isDiffView(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsMissingBlankLineBeforeBreakStatement(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeBreakStatement(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    project
        ?.getSourceFile(document.fileName)
        ?.getDescendants()
        .filter(it => Node.isBlock(it))
        .forEach(it => {
            const stmts = it.getStatements();
            if (stmts.length < 2) {
                return;
            }

            const lastStmt = stmts[stmts.length - 1];
            if (!Node.isBreakStatement(lastStmt)) {
                return;
            }

            const prevStmt = stmts[stmts.length - 2];
            const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
            const breakStartLine = document.positionAt(
                lastStmt.getStart()
            ).line;

            if (breakStartLine - prevEndLine < 2) {
                const diagnostic = new vscode.Diagnostic(
                    buildRangeByLineIndex(document, breakStartLine),
                    "Missing blank line before break statement.",
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = `@${extensionName}/blank-line-before-break-statement`;

                diagnostics.push(diagnostic);
            }
        });
}
