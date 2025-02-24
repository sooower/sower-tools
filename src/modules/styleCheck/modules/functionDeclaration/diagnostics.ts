import ts from "typescript";

import { extensionCtx, extensionName, vscode } from "@/core";
import {
    findAllFuncOrCtorDeclarationNodes,
    isFunctionParameter,
    TFunc,
} from "@/utils/typescript";
import { detectCommentKind } from "@/utils/typescript/comment";
import { createSourceFileByDocument, isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
    hasValidLeadingSpaceBefore,
    isFirstLineOfParent,
    isIgnoredFile,
} from "../shared/utils";
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
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableStyleCheckFunctionDeclaration) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    if (isIgnoredFile(document)) {
        diagnosticCollection.delete(document.uri);

        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    checkIsMissingBlankLineBeforeFunctionDeclaration(document, diagnostics);

    diagnosticCollection.set(document.uri, diagnostics);
}

function checkIsMissingBlankLineBeforeFunctionDeclaration(
    document: vscode.TextDocument,
    diagnostics: vscode.Diagnostic[]
) {
    const appendDiagnostic = (node: TFunc) => {
        // Skip if the function declaration is a duplicate (function or method
        // overload), else add the function name to the set
        if (node.name !== undefined) {
            if (funcNames.has(node.name.getText())) {
                return;
            }

            funcNames.add(node.name.getText());
        }

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

        if (isInAssignmentExpression(node)) {
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
    };

    const funcNames = new Set<string>();

    findAllFuncOrCtorDeclarationNodes(
        createSourceFileByDocument(document)
    ).forEach(node => {
        appendDiagnostic(node);
    });
}

export function isInAssignmentExpression(node: TFunc) {
    return (
        ts.isBinaryExpression(node.parent) &&
        node.parent.operatorToken.kind === ts.SyntaxKind.EqualsToken &&
        node.parent.right === node
    );
}
