import { Expression, Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { isIgnoredFile } from "../shared/utils";
import { enableStyleCheckTryStatement } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticTryStatement() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("try-statement");
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

    const diagnostics: vscode.Diagnostic[] = [];
    checkUnAwaitedPromiseCallExpression(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkUnAwaitedPromiseCallExpression(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    if (project === undefined) {
        return;
    }

    const sourceFile = project.getSourceFile(document.uri.fsPath);
    if (sourceFile === undefined) {
        return;
    }

    const appendDiagnostic = () => {
        sourceFile.forEachDescendant(node => {
            if (!Node.isTryStatement(node)) {
                return;
            }

            node.getTryBlock().forEachChild(child => {
                if (!Node.isExpressionStatement(child)) {
                    return;
                }

                const expr = child.getExpression();
                if (!isUnAwaitedPromise(expr)) {
                    return;
                }

                const diagnostic = new vscode.Diagnostic(
                    buildRangeByLineIndex(
                        document,
                        expr.getStartLineNumber() - 1
                    ),
                    "Missing await before async function call expression.",
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostic.code = `@${extensionName}/un-awaited-promise-call-expression`;

                diagnostics.push(diagnostic);
            });
        });
    };

    appendDiagnostic();
}

function isUnAwaitedPromise(expr: Expression): boolean {
    const type = expr.getType();
    const symbolName = type.getSymbol()?.getName();
    const isPromise =
        symbolName === "Promise" && type.getText().startsWith("Promise<");

    return isPromise && !Node.isAwaitExpression(expr.getParent());
}
