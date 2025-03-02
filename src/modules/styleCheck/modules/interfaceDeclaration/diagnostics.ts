import { Node, SyntaxKind } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
    detectCommentKind,
    hasValidLeadingSpaceBefore,
    isDiffView,
    isIgnoredFile,
} from "../shared/utils";
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

    if (isDiffView(document)) {
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
    project
        ?.getSourceFile(document.uri.fsPath)
        ?.getDescendants()
        .filter(it => Node.isInterfaceDeclaration(it))
        .forEach(it => {
            const nodeStartLineIndex = document.positionAt(it.getStart()).line;

            // Skip if the interface declaration is the first line of the document
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

            // Skip if the node is the first interface declaration in a module block
            if (
                Node.isModuleBlock(it.getParent()) &&
                it
                    .getParent()
                    .getChildrenOfKind(SyntaxKind.InterfaceDeclaration)
                    .at(0) === it
            ) {
                return;
            }

            const diagnostic = new vscode.Diagnostic(
                buildRangeByLineIndex(document, nodeStartLineIndex),
                "Missing a blank line before the interface declaration.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/blank-line-before-interface-declaration`;

            diagnostics.push(diagnostic);
        });
}
