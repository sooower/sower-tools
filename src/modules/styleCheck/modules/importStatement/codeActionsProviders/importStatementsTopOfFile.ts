import { extensionCtx, extensionName, project, vscode } from "@/core";

export function registerCodeActionsProviderImportStatementsTopOfFile() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                const importStmtsCount =
                    project
                        ?.getSourceFile(document.fileName)
                        ?.getImportDeclarations().length ?? 0;

                return context.diagnostics
                    .filter(
                        d =>
                            d.code ===
                            `@${extensionName}/import-statements-top-of-file`
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Move import to the top of the file",
                            vscode.CodeActionKind.QuickFix
                        );

                        codeAction.diagnostics = [diagnostic];
                        codeAction.edit = new vscode.WorkspaceEdit();
                        codeAction.edit.delete(
                            document.uri,
                            new vscode.Range(
                                diagnostic.range.start,
                                new vscode.Position(
                                    diagnostic.range.end.line + 1,
                                    0
                                )
                            )
                        );
                        codeAction.edit.insert(
                            document.uri,
                            new vscode.Position(0, 0),
                            document.getText(diagnostic.range) +
                                (importStmtsCount > 1 ? "\n" : "\n\n") // Keep a blank line after the import statement if there are no import statements
                        );

                        return codeAction;
                    });
            },
        })
    );
}
