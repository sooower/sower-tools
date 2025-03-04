import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { debouncedStyleCheck } from "../../utils";
import { isDiffView, isIgnoredFile } from "../shared/utils";
import { enableStyleCheckContinueStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticContinueStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("continue-statement");
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (!isTypeScriptFile(document)) {
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

    if (isDiffView(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsMissingBlankLineBeforeContinueStatement(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeContinueStatement(
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
            if (!Node.isContinueStatement(lastStmt)) {
                return;
            }

            const prevStmt = stmts[stmts.length - 2];
            const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
            const continueStartLine = document.positionAt(
                lastStmt.getStart()
            ).line;

            if (continueStartLine - prevEndLine < 2) {
                const diagnostic = new vscode.Diagnostic(
                    buildRangeByLineIndex(document, continueStartLine),
                    "Missing blank line before continue statement.",
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = `@${extensionName}/blank-line-before-continue-statement`;

                diagnostics.push(diagnostic);
            }
        });
}
