import { Position } from "vscode";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                return context.diagnostics
                    .filter(
                        diagnostic =>
                            diagnostic.code ===
                                `@${extensionName}/blank-line-before-return-statement` &&
                            isCursorInDiagnosticRange(diagnostic, range)
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Add blank line before return statement",
                            vscode.CodeActionKind.QuickFix
                        );
                        codeAction.edit = new vscode.WorkspaceEdit();
                        codeAction.edit.insert(
                            document.uri,
                            new Position(diagnostic.range.start.line, 0),
                            "\n"
                        );

                        return codeAction;
                    });
            },
        })
    );
}

export function isCursorInDiagnosticRange(
    diagnostic: vscode.Diagnostic,
    range: vscode.Range | vscode.Selection
) {
    return (
        range.start.line >= diagnostic.range.start.line &&
        range.end.line <= diagnostic.range.end.line
    );
}
