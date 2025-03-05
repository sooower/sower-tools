import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { buildRangeByLineIndex, isTypeScriptFile } from "@/utils/vscode";

import { debouncedStyleCheck } from "../../utils";
import { isDiffView, isIgnoredFile } from "../shared/utils";
import { enableStyleCheckReturnStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticReturnStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("return-statement");
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
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

    if (isDiffView(document)) {
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
            if (!Node.isReturnStatement(lastStmt)) {
                return;
            }

            const prevStmt = stmts[stmts.length - 2];
            const prevEndLine = document.positionAt(prevStmt.getEnd()).line;
            const returnStartLine = document.positionAt(
                lastStmt.getStart()
            ).line;

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
