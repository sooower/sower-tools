import { extensionCtx, extensionName, vscode } from "@/core";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("*", {
            provideCodeActions: (document, range, context, token) => {
                const selectedText = document.getText(range).trim();
                if (selectedText === "") {
                    return [];
                }

                // Encrypt text

                const keyEncryptCodeAction = new vscode.CodeAction(
                    "Encrypt text",
                    vscode.CodeActionKind.RefactorRewrite
                );
                keyEncryptCodeAction.command = {
                    command: `${extensionName}.keyCryptoTools.keyEncrypt`,
                    title: "",
                    arguments: [document, range, selectedText],
                };

                // Decrypt text

                const keyDecryptCodeAction = new vscode.CodeAction(
                    "Decrypt text",
                    vscode.CodeActionKind.RefactorRewrite
                );
                keyDecryptCodeAction.command = {
                    command: `${extensionName}.keyCryptoTools.keyDecrypt`,
                    title: "",
                    arguments: [document, range, selectedText],
                };

                return [keyEncryptCodeAction, keyDecryptCodeAction];
            },
        })
    );
}
