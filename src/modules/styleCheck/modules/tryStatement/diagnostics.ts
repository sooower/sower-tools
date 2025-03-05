import { Expression, Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { buildRangeByLineIndex, isTypeScriptFile } from "@/utils/vscode";

import { debouncedStyleCheck } from "../../utils";
import { isDiffView, isIgnoredFile } from "../shared/utils";
import { enableStyleCheckTryStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticTryStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("try-statement");
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
}

async function updateDiagnostics(document: vscode.TextDocument) {
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableStyleCheckTryStatement) {
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
    checkUnAwaitedPromiseCallExpression(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkUnAwaitedPromiseCallExpression(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    project
        ?.getSourceFile(document.fileName)
        ?.getDescendants()
        .filter(it => Node.isTryStatement(it))
        .forEach(it => {
            it.getTryBlock()
                .getDescendants()
                .filter(it => Node.isExpressionStatement(it))
                .forEach(it => {
                    const expr = it.getExpression();
                    if (!isUnAwaitedPromise(expr)) {
                        return;
                    }

                    const diagnostic = new vscode.Diagnostic(
                        buildRangeByLineIndex(
                            document,
                            expr.getStartLineNumber() - 1
                        ),
                        "Missing await before async function call expression in try statement.",
                        vscode.DiagnosticSeverity.Warning
                    );
                    diagnostic.code = `@${extensionName}/un-awaited-promise-call-expression`;

                    diagnostics.push(diagnostic);
                });
        });
}

function isUnAwaitedPromise(expr: Expression): boolean {
    const type = expr.getType();
    const symbolName = type.getSymbol()?.getName();
    const isPromise =
        symbolName === "Promise" && type.getText().startsWith("Promise<");

    return isPromise && !Node.isAwaitExpression(expr.getParent());
}
