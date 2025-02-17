import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import {
    findAllFuncOrCtorDeclarationNodes,
    findFirstMethodOrCtorDeclarationNode,
    TFunc,
} from "@/utils/typescript";
import { detectCommentType } from "@/utils/typescript/comment";
import { createSourceFileByDocument } from "@/utils/vscode";

import { hasValidLeadingSpaceBefore } from "../../utils";

let diagnosticCollection: vscode.DiagnosticCollection;

export function registerDiagnosticFunctionDeclaration() {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(
        "function-declaration"
    );

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

    // Skip if the function declaration is the first line
    if (funcDeclNodeStartLineIndex === 0) {
        return;
    }

    // Skip if the constructor or method declaration is the first one of its parent class
    const firstCtorOrMethodDecl = findFirstMethodOrCtorDeclarationNode(
        createSourceFileByDocument(document)
    );
    if (firstCtorOrMethodDecl?.getStart() === funcNodeStartPos) {
        return;
    }

    if (hasValidLeadingSpaceBefore(document, funcDeclNodeStartLineIndex)) {
        return;
    }

    // Skip if the previous line is not a comment
    const prevLine = document.lineAt(funcDeclNodeStartLineIndex - 1);
    if (detectCommentType(prevLine.text) !== null) {
        return;
    }

    const diagnostic = new vscode.Diagnostic(
        new vscode.Range(
            document.positionAt(funcNodeStartPos),
            document.positionAt(funcNodeStartPos)
        ),
        "Missing a blank line before the function declaration",
        vscode.DiagnosticSeverity.Warning
    );
    diagnostic.code = `@${extensionName}/blank-line-before-function-declaration`;

    diagnostics.push(diagnostic);
}
