import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                return context.diagnostics
                    .filter(
                        d =>
                            d.code ===
                            `@${extensionName}/blank-line-before-interface-declaration`
                    )
                    .map(diagnostic => {
                        const codeAction = new vscode.CodeAction(
                            "Add a blank line before the interface declaration",
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
