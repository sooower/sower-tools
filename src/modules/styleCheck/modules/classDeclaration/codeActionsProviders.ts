import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";

import { enableStyleCheckClassDeclaration } from "./configs";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                if (!enableStyleCheckClassDeclaration) {
                    return [];
                }

                return context.diagnostics
                    .filter(
                        d =>
                            d.code ===
                            `@${extensionName}/blank-line-before-class-declaration`
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Add a blank line before the class declaration",
                            vscode.CodeActionKind.QuickFix
                        );

                        codeAction.diagnostics = [diagnostic];
                        codeAction.edit = new vscode.WorkspaceEdit();
                        codeAction.edit.insert(
                            document.uri,
                            new vscode.Position(diagnostic.range.start.line, 0),
                            "\n"
                        );

                        return codeAction;
                    });
            },
        })
    );
}
