import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
    detectCommentKind,
    hasValidLeadingSpaceBefore,
    isDiffView,
    isIgnoredFile,
} from "../shared/utils";
import { enableStyleCheckClassDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticClassDeclaration() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("class-declaration");

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

    if (!enableStyleCheckClassDeclaration) {
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

    checkIsMissingBlankLineBeforeClassDeclaration(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeClassDeclaration(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    project
        ?.getSourceFile(document.uri.fsPath)
        ?.getDescendants()
        .filter(it => Node.isClassDeclaration(it))
        .forEach(it => {
            const nodeStartLineIndex = document.positionAt(it.getStart()).line;

            // Skip if the class declaration is the first line of the document
            if (nodeStartLineIndex === 0) {
                return;
            }

            if (hasValidLeadingSpaceBefore(document, nodeStartLineIndex)) {
                return;
            }

            // Skip if the previous line is a comment
            const prevLine = document.lineAt(nodeStartLineIndex - 1);
            if (detectCommentKind(prevLine.text) !== null) {
                return;
            }

            const diagnostic = new vscode.Diagnostic(
                buildRangeByLineIndex(document, nodeStartLineIndex),
                "Missing a blank line before the class declaration.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/blank-line-before-class-declaration`;

            diagnostics.push(diagnostic);
        });
}
