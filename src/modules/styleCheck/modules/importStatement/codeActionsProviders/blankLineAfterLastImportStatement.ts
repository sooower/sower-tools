import { extensionCtx, extensionName, vscode } from "@/core";

export function registerCodeActionsProviderBlankAfterLastImportStatement() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                return context.diagnostics
                    .filter(
                        d =>
                            d.code ===
                            `@${extensionName}/blank-line-after-last-import-statement`
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Add a blank line after the last import statement",
                            vscode.CodeActionKind.QuickFix
                        );

                        codeAction.diagnostics = [diagnostic];
                        codeAction.edit = new vscode.WorkspaceEdit();
                        codeAction.edit.insert(
                            document.uri,
                            new vscode.Position(
                                diagnostic.range.end.line + 1,
                                0
                            ),
                            "\n"
                        );

                        return codeAction;
                    });
            },
        })
    );
}
