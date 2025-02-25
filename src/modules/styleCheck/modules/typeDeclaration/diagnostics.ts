import { Node } from "ts-morph";
import ts from "typescript";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { findAllTypeDeclarationNodes } from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument, isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { hasValidLeadingSpaceBefore, isIgnoredFile } from "../shared/utils";
import { enableStyleCheckTypeDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticTypeDeclaration() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("type-declaration");

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

    if (!enableStyleCheckTypeDeclaration) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsMissingBlankLineBeforeTypeDeclaration(document, diagnostics);
    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeTypeDeclaration(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const appendDiagnostic = (node: ts.TypeAliasDeclaration) => {
        const typeDeclNodeStartPos = node.getStart();
        const typeDeclNodeStartLineIndex =
            document.positionAt(typeDeclNodeStartPos).line;

        // Skip if the type declaration is the first line of the document
        if (typeDeclNodeStartLineIndex === 0) {
            return;
        }

        // Skip if the type declaration only contains a single line
        if (
            document.positionAt(node.getStart()).line ===
            document.positionAt(node.getEnd()).line
        ) {
            return;
        }

        if (hasValidLeadingSpaceBefore(document, typeDeclNodeStartLineIndex)) {
            return;
        }

        // Skip if the previous line is not a comment
        const prevLine = document.lineAt(typeDeclNodeStartLineIndex - 1);
        if (detectCommentKind(prevLine.text) !== null) {
            return;
        }

        const diagnostic = new vscode.Diagnostic(
            buildRangeByLineIndex(document, typeDeclNodeStartLineIndex),
            "Missing a blank line before the type declaration.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-type-declaration`;

        diagnostics.push(diagnostic);
    };

    findAllTypeDeclarationNodes(createSourceFileByDocument(document))
        .filter(node => !ts.isParenthesizedTypeNode(node))
        .forEach(node => {
            appendDiagnostic(node);
        });

    project?.getSourceFile(document.uri.fsPath)?.forEachDescendant(node => {
        if (!Node.isTypeAliasDeclaration(node)) {
            return;
        }

        if (Node.isParenthesizedTypeNode(node)) {
            return;
        }

        const nodeStartPos = node.getStart();
        const nodeStartLineIndex = document.positionAt(nodeStartPos).line;

        // Skip if the type declaration is the first line of the document
        if (nodeStartLineIndex === 0) {
            return;
        }

        // Skip if the type declaration only contains a single line
        if (node.getStartLineNumber() === node.getEndLineNumber()) {
            return;
        }

        if (hasValidLeadingSpaceBefore(document, nodeStartLineIndex)) {
            return;
        }

        // Skip if the previous line is not a comment
        const prevLine = document.lineAt(nodeStartLineIndex - 1);
        if (detectCommentKind(prevLine.text) !== null) {
            return;
        }

        const diagnostic = new vscode.Diagnostic(
            buildRangeByLineIndex(document, nodeStartLineIndex),
            "Missing a blank line before the type declaration.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-type-declaration`;

        diagnostics.push(diagnostic);
    });
}
