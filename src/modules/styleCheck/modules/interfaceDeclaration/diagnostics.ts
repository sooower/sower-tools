import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { detectCommentKind } from "@/utils/typescript/comment";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
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
    project?.getSourceFile(document.uri.fsPath)?.forEachDescendant(node => {
        if (!Node.isInterfaceDeclaration(node)) {
            return;
        }

        const nodeStartPos = node.getStart();
        const nodeStartLineIndex = document.positionAt(nodeStartPos).line;

        // Skip if the interface declaration is the first line of the document
        if (nodeStartLineIndex === 0) {
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
            "Missing a blank line before the interface declaration.",
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.code = `@${extensionName}/blank-line-before-interface-declaration`;

        diagnostics.push(diagnostic);
    });
}
