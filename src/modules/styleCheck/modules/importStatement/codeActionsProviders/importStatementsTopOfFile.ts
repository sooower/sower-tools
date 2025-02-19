import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";

export function registerCodeActionsProviderImportStatementsTopOfFile() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
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
                        codeAction.edit.delete(document.uri, diagnostic.range);
                        codeAction.edit.insert(
                            document.uri,
                            new vscode.Position(0, 0),
                            document.getText(diagnostic.range) + "\n"
                        );

                        return codeAction;
                    });
            },
        })
    );
}
