import * as vscode from "vscode";

import { extensionName } from "@/core/context";

export function registerCodeActionsProviderAddBlankLineBeforeComment() {
    vscode.languages.registerCodeActionsProvider("typescript", {
        provideCodeActions(document, range, context, token) {
            return context.diagnostics
                .filter(
                    d =>
                        d.code === `@${extensionName}/blank-line-before-comment`
                )
                .map(diagnostic => {
                    const codeAction = new vscode.CodeAction(
                        "Add a blank line before the comment",
                        vscode.CodeActionKind.QuickFix
                    );

                    codeAction.edit = new vscode.WorkspaceEdit();
                    codeAction.edit.insert(
                        document.uri,
                        new vscode.Position(diagnostic.range.start.line, 0),
                        "\n"
                    );

                    return codeAction;
                });
        },
    });
}
