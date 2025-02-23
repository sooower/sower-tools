import ts from "typescript";

import { isIgnoredFile } from "@/modules/styleCheck/modules/shared/utils";

import { extensionCtx, extensionName, vscode } from "@/core";
import { findAllTopLevelStatements } from "@/utils/typescript/statement";
import { createSourceFileByDocument, isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByNode } from "@/utils/vscode/range";

import { enableStyleCheckImportStatement } from "../configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticImportStatementsTopOfFile() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "import-statements-top-of-file"
    );

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

    if (!enableStyleCheckImportStatement) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsImportStatementsTopOfFile(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsImportStatementsTopOfFile(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const appendDiagnostic = (node: ts.Statement) => {
        const diagnostic = new vscode.Diagnostic(
            buildRangeByNode(document, node),
            "Import statements should always be at the top of the file.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/import-statements-top-of-file`;

        diagnostics.push(diagnostic);
    };

    const topLevelStatements = findAllTopLevelStatements(
        createSourceFileByDocument(document)
    );
    let foundNonImportStatement = false;
    for (const stmt of topLevelStatements) {
        if (!ts.isImportDeclaration(stmt)) {
            foundNonImportStatement = true;

            continue;
        }

        if (ts.isImportDeclaration(stmt) && foundNonImportStatement) {
            appendDiagnostic(stmt);
        }
    }
}
