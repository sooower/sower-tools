import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { findAllTypeDeclarationNodes } from "@/utils/typescript";
import { detectCommentType } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";

import { hasValidLeadingSpace } from "../../utils";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticTypeDeclaration() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("type-declaration");

    extensionCtx.subscriptions.push(
        diagnosticCollection,
        vscode.workspace.onDidOpenTextDocument(updateDiagnostics),
        vscode.workspace.onDidSaveTextDocument(updateDiagnostics)
    );
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (document.languageId !== "typescript") {
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    findAllTypeDeclarationNodes(createSourceFileByDocument(document))
        .filter(node => !ts.isParenthesizedTypeNode(node))
        .forEach(node => {
            appendDiagnostic(node, document, diagnostics);
        });

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    node: ts.TypeAliasDeclaration,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
): vscode.Diagnostic | undefined {
    const typeDeclNodeStartPos = node.getStart();
    const typeDeclNodeStartLineIndex =
        document.positionAt(typeDeclNodeStartPos).line;

    if (typeDeclNodeStartLineIndex === 0) {
        return;
    }

    if (hasValidLeadingSpace(document, typeDeclNodeStartLineIndex)) {
        return;
    }

    // Skip if the previous line is not a comment
    const prevLine = document.lineAt(typeDeclNodeStartLineIndex - 1);
    if (detectCommentType(prevLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
            document.positionAt(typeDeclNodeStartPos),
            document.positionAt(typeDeclNodeStartPos)
        ),
        "Need a blank line before the type declaration",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-type-declaration`;

    diagnostics.push(diagnostic);
}
