import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findTopLevelEnumDeclarationNodes } from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { hasValidLeadingSpaceBefore } from "../../utils";
import { enableStyleCheckEnumDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticEnumDeclaration() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("enum-declaration");

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

    if (!enableStyleCheckEnumDeclaration) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    findTopLevelEnumDeclarationNodes(
        createSourceFileByDocument(document)
    ).forEach(node => {
        appendDiagnostic(node, document, diagnostics);
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    node: ts.EnumDeclaration,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
): vscode.Diagnostic | undefined {
    const enumNodeStartPos = node.getStart();
    const enumDeclNodeStartLineIndex =
        document.positionAt(enumNodeStartPos).line;

    // Skip if the enum declaration is the first line of the document
    if (enumDeclNodeStartLineIndex === 0) {
        return;
    }

    if (hasValidLeadingSpaceBefore(document, enumDeclNodeStartLineIndex)) {
        return;
    }

    // Skip if the previous line is a comment
    const prevLine = document.lineAt(enumDeclNodeStartLineIndex - 1);
    if (detectCommentKind(prevLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        buildRangeByLineIndex(document, enumDeclNodeStartLineIndex),
        "Missing a blank line before the enum declaration.",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-enum-declaration`;

    diagnostics.push(diagnostic);
}
