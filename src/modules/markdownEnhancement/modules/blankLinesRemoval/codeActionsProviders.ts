import { extensionCtx, extensionName, vscode } from "@/core";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("markdown", {
            provideCodeActions(document, range, context, token) {
                if (document.getText().trim().length === 0) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    "Remove Blank Lines And Open In New Document",
                    vscode.CodeActionKind.RefactorExtract
                );
                codeAction.command = {
                    command: `${extensionName}.markdownEnhancement.removeBlankLinesAndOpenInNewDocument`,
                    title: "",
                    arguments: [document],
                };

                return [codeAction];
            },
        }),
        vscode.languages.registerCodeActionsProvider("markdown", {
            provideCodeActions(document, range, context, token) {
                if (document.getText().trim().length === 0) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    "Remove Blank Lines And Copy To Clipboard",
                    vscode.CodeActionKind.RefactorExtract
                );
                codeAction.command = {
                    command: `${extensionName}.markdownEnhancement.removeBlankLinesAndCopyToClipboard`,
                    title: "",
                    arguments: [document],
                };

                return [codeAction];
            },
        })
    );
}
