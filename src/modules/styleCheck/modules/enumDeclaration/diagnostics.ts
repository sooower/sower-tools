import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { debouncedStyleCheck } from "../../utils";
import {
    detectCommentKind,
    hasValidLeadingSpaceBefore,
    isDiffView,
    isIgnoredFile,
} from "../shared/utils";
import { enableStyleCheckEnumDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticEnumDeclaration() {
    diagnosticCollection =
        vscode.languages.createDiagnosticCollection("enum-declaration");
    extensionCtx.subscriptions.push(diagnosticCollection);
    debouncedStyleCheck(updateDiagnostics);
}

function updateDiagnostics(document: vscode.TextDocument) {
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableStyleCheckEnumDeclaration) {
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

    checkIsMissingBlankLineBeforeEnumDeclaration(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeEnumDeclaration(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    project
        ?.getSourceFile(document.fileName)
        ?.getDescendants()
        .filter(it => Node.isEnumDeclaration(it))
        .forEach(it => {
            const nodeStartLineIndex = document.positionAt(it.getStart()).line;

            // Skip if the enum declaration is the first line of the document
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
                "Missing a blank line before the enum declaration.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/blank-line-before-enum-declaration`;

            diagnostics.push(diagnostic);
        });
}
