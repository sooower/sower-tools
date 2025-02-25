import {
    hasValidLeadingSpaceAfter,
    isIgnoredFile,
} from "@/modules/styleCheck/modules/shared/utils";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { detectCommentKind } from "@/utils/typescript/comment";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByNode } from "@/utils/vscode/range";

import { enableStyleCheckImportStatement } from "../configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticBlankLineAfterLastImportStatement() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "blank-line-after-last-import-statement"
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

    checkIsMissingBlankLineAfterLastImportStatement(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineAfterLastImportStatement(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const lastImportStatementNode = project
        ?.getSourceFile(document.uri.fsPath)
        ?.getImportDeclarations()
        .pop();

    if (lastImportStatementNode === undefined) {
        return;
    }

    const nodeEndLineIndex = document.positionAt(
        lastImportStatementNode.getEnd()
    ).line;

    // Skip if the last import statement is the last line of the file
    if (nodeEndLineIndex === document.lineCount - 1) {
        return;
    }

    if (hasValidLeadingSpaceAfter(document, nodeEndLineIndex)) {
        return;
    }

    // Skip if the next line is a comment
    const nextLine = document.lineAt(nodeEndLineIndex + 1);
    if (detectCommentKind(nextLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        buildRangeByNode(document, lastImportStatementNode),
        "Missing a blank line after the last import statement.",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-after-last-import-statement`;

    diagnostics.push(diagnostic);
}
