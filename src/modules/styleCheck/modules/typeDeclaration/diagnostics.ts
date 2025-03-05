import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { buildRangeByLineIndex, isTypeScriptFile } from "@/utils/vscode";

import { debouncedStyleCheck } from "../../utils";
import {
    detectCommentKind,
    hasValidLeadingSpaceBefore,
    isDiffView,
    isIgnoredFile,
} from "../shared/utils";
import { enableStyleCheckTypeDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticTypeDeclaration() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("type-declaration");
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
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

    if (isDiffView(document)) {
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
    project
        ?.getSourceFile(document.fileName)
        ?.getDescendants()
        .filter(
            it =>
                Node.isTypeAliasDeclaration(it) &&
                !Node.isParenthesizedTypeNode(it)
        )
        .forEach(it => {
            const nodeStartLineIndex = document.positionAt(it.getStart()).line;

            // Skip if the type declaration is the first line of the document
            if (nodeStartLineIndex === 0) {
                return;
            }

            // Skip if the type declaration only contains a single line
            if (it.getStartLineNumber() === it.getEndLineNumber()) {
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
                "Missing a blank line before the type declaration.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/blank-line-before-type-declaration`;

            diagnostics.push(diagnostic);
        });
}
