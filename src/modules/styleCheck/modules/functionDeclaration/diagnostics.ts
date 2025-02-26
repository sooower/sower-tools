import {
    ArrowFunction,
    FunctionDeclaration,
    MethodDeclaration,
    Node,
    SyntaxKind,
} from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { detectCommentKind } from "@/utils/typescript/comment";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByLineIndex } from "@/utils/vscode/range";

import {
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

    project?.getSourceFile(document.uri.fsPath)?.forEachDescendant(node => {
        if (
            (Node.isArrowFunction(node) || Node.isFunctionDeclaration(node)) &&
            isFunctionParameter(node)
        ) {
            return;
        }

        if (
            !Node.isFunctionDeclaration(node) &&
            !Node.isMethodDeclaration(node)
        ) {
            return;
        }

        const name = node.getName();
        if (name === undefined) {
            return;
        }

        // Skip if the function declaration is a duplicate (function or method
        // overload), else add the function name to the set
        if (funcNames.has(name)) {
            return;
        }

        funcNames.add(name);

        const nodeStartPos = node.getStart();
        const nodeStartLineIndex = document.positionAt(nodeStartPos).line;

        // Skip if the function declaration is the first line of the document
        if (nodeStartLineIndex === 0) {
            return;
        }

        if (isFirstLineOfParent(document, nodeStartLineIndex)) {
            return;
        }

        if (isInAssignmentExpression(node)) {
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

function isFunctionParameter(node: FunctionDeclaration | ArrowFunction) {
    return Node.isCallExpression(node.getParent());
}

function isInAssignmentExpression(
    node: FunctionDeclaration | MethodDeclaration
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
