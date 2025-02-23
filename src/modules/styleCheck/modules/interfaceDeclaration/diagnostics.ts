import ts from "typescript";

import { extensionCtx, extensionName, vscode } from "@/core";
import { findAllInterfaceDeclarationNodes } from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument, isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { hasValidLeadingSpaceBefore, isIgnoredFile } from "../shared/utils";
import { enableStyleCheckInterfaceDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticInterfaceDeclaration() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "interface-declaration"
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

    if (!enableStyleCheckInterfaceDeclaration) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsMissingBlankLineBeforeInterfaceDeclaration(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeInterfaceDeclaration(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const appendDiagnostic = (node: ts.InterfaceDeclaration) => {
        const interfaceDeclNodeStartPos = node.getStart();
        const interfaceDeclNodeStartLineIndex = document.positionAt(
            interfaceDeclNodeStartPos
        ).line;

        // Skip if the interface declaration is the first line of the document
        if (interfaceDeclNodeStartLineIndex === 0) {
            return;
        }

        if (
            hasValidLeadingSpaceBefore(
                document,
                interfaceDeclNodeStartLineIndex
            )
        ) {
            return;
        }

        // Skip if the previous line is not a comment
        const prevLine = document.lineAt(interfaceDeclNodeStartLineIndex - 1);
        if (detectCommentKind(prevLine.text) !== null) {
            return;
        }

        const diagnostic = new vscode.Diagnostic(
            buildRangeByLineIndex(document, interfaceDeclNodeStartLineIndex),
            "Missing a blank line before the interface declaration.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-interface-declaration`;

        diagnostics.push(diagnostic);
    };

    findAllInterfaceDeclarationNodes(
        createSourceFileByDocument(document)
    ).forEach(node => {
        appendDiagnostic(node);
    });
}
