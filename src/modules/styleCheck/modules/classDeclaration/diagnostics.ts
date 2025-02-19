import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findAllClassDeclarationNodes } from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { hasValidLeadingSpaceBefore } from "../../utils";
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
    if (document.languageId !== "typescript") {
        return;
    }

    if (!enableStyleCheckClassDeclaration) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    findAllClassDeclarationNodes(createSourceFileByDocument(document)).forEach(
        node => {
            appendDiagnostic(node, document, diagnostics);
        }
    );

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    node: ts.ClassDeclaration,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
): vscode.Diagnostic | undefined {
    const classNodeStartPos = node.getStart();
    const classDeclNodeStartLineIndex =
        document.positionAt(classNodeStartPos).line;

    // Skip if the class declaration is the first line of the document
    if (classDeclNodeStartLineIndex === 0) {
        return;
    }

    if (hasValidLeadingSpaceBefore(document, classDeclNodeStartLineIndex)) {
        return;
    }

    // Skip if the previous line is a comment
    const prevLine = document.lineAt(classDeclNodeStartLineIndex - 1);
    if (detectCommentKind(prevLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        buildRangeByLineIndex(document, classDeclNodeStartLineIndex),
        "Missing a blank line before the class declaration.",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-class-declaration`;

    diagnostics.push(diagnostic);
}
