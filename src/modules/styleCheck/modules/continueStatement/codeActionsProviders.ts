import { Position } from "vscode";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                return context.diagnostics
                    .filter(
                        diagnostic =>
                            diagnostic.code ===
                            `@${extensionName}/blank-line-before-continue-statement`
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Add blank line before continue statement",
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
