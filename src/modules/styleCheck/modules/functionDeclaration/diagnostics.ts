import {
    ArrowFunction,
    ConstructorDeclaration,
    FunctionDeclaration,
    MethodDeclaration,
    Node,
    SyntaxKind,
} from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
    detectCommentKind,
    hasValidLeadingSpaceBefore,
    isDiffView,
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

    if (isDiffView(document)) {
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
    const funcNames = new Set<string>();

    project
        ?.getSourceFile(document.uri.fsPath)
        ?.getDescendants()
        .filter(
            it =>
                Node.isArrowFunction(it) ||
                Node.isFunctionDeclaration(it) ||
                Node.isConstructorDeclaration(it) ||
                Node.isMethodDeclaration(it)
        )
        .forEach(it => {
            if (isFunctionParameter(it)) {
                return;
            }

            // Only function and method declarations have a name, skip other
            // declarations
            if (
                Node.isFunctionDeclaration(it) ||
                Node.isMethodDeclaration(it)
            ) {
                const funcOrMethodName = it.getName();
                if (funcOrMethodName === undefined) {
                    return;
                }

                // Skip if the function declaration is a duplicate (function or method
                // overload), else add the function name to the set
                if (funcNames.has(funcOrMethodName)) {
                    return;
                }

                funcNames.add(funcOrMethodName);
            }

            const nodeStartLineIndex = document.positionAt(it.getStart()).line;

            // Skip if the function declaration is the first line of the document
            if (nodeStartLineIndex === 0) {
                return;
            }

            if (isFirstLineOfParent(document, nodeStartLineIndex)) {
                return;
            }

            if (isInAssignmentExpression(it)) {
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
                "Missing a blank line before the function declaration.",
                vscode.DiagnosticSeverity.Warning
            );
            diagnostic.code = `@${extensionName}/blank-line-before-function-declaration`;

            diagnostics.push(diagnostic);
        });
}

function isFunctionParameter(
    node:
        | FunctionDeclaration
        | ArrowFunction
        | MethodDeclaration
        | ConstructorDeclaration
) {
    return Node.isCallExpression(node.getParent());
}

function isInAssignmentExpression(
    node:
        | FunctionDeclaration
        | ArrowFunction
        | ConstructorDeclaration
        | MethodDeclaration
) {
    const parent = node.getParent();
    if (!Node.isBinaryExpression(parent)) {
        return false;
    }

    if (parent.getOperatorToken().getKind() !== SyntaxKind.EqualsToken) {
        return false;
    }

    if (parent.getRight().getText() !== node.getText()) {
        return false;
    }

    return true;
}
