import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import {
    findAllFuncOrCtorDeclarationNodes,
    isFunctionParameter,
    TFunc,
} from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import { hasValidLeadingSpaceBefore, isFirstLineOfParent } from "../../utils";
import { enableStyleCheckFunctionDeclaration } from "./configs";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticFunctionDeclaration() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "function-declaration"
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
    if (document.languageId !== "typescript") {
        return;
    }

    if (!enableStyleCheckFunctionDeclaration) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    findAllFuncOrCtorDeclarationNodes(
        createSourceFileByDocument(document)
    ).forEach(node => {
        appendDiagnostic(node, document, diagnostics);
    });

    diagnosticCollection.set(document.uri, diagnostics);
}

function appendDiagnostic(
    node: TFunc,
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
): vscode.Diagnostic | undefined {
    const funcNodeStartPos = node.getStart();
    const funcDeclNodeStartLineIndex =
        document.positionAt(funcNodeStartPos).line;

    // Skip if the function declaration is the first line of the document
    if (funcDeclNodeStartLineIndex === 0) {
        return;
    }

    if (isFirstLineOfParent(document, funcDeclNodeStartLineIndex)) {
        return;
    }

    if (isFunctionParameter(node)) {
        return;
    }

    if (hasValidLeadingSpaceBefore(document, funcDeclNodeStartLineIndex)) {
        return;
    }

    // Skip if the previous line is a comment
    const prevLine = document.lineAt(funcDeclNodeStartLineIndex - 1);
    if (detectCommentKind(prevLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        buildRangeByLineIndex(document, funcDeclNodeStartLineIndex),
        "Missing a blank line before the function declaration.",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-function-declaration`;

    diagnostics.push(diagnostic);
}
