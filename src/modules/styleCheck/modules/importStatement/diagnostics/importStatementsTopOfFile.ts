import { Node } from "ts-morph";

import { debouncedStyleCheck } from "@/modules/styleCheck/utils";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByNode } from "@/utils/vscode/range";

import { isDiffView, isIgnoredFile } from "../../shared/utils";
import { enableStyleCheckImportStatement } from "../configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticImportStatementsTopOfFile() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "import-statements-top-of-file"
    );
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
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

    if (isDiffView(document)) {
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
    let foundNonImportStatement = false;

    project
        ?.getSourceFile(document.fileName)
        ?.getStatements()
        .forEach(stmt => {
            if (!Node.isImportDeclaration(stmt)) {
                foundNonImportStatement = true;

                return;
            }

            if (!foundNonImportStatement) {
                return;
            }

            const diagnostic = new vscode.Diagnostic(
                buildRangeByNode(document, stmt),
                "Import statements should always be at the top of the file.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/import-statements-top-of-file`;

            diagnostics.push(diagnostic);
        });
}
