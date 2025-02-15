import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";
import { extensionName } from "@/shared/init";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "*", // All languages
            new KeyCryptoToolsCodeActionProvider()
        )
    );
}

class KeyCryptoToolsCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const keyEncryptCodeAction = new vscode.CodeAction(
            "Encrypt text",
            vscode.CodeActionKind.RefactorRewrite
        );
        keyEncryptCodeAction.command = {
            command: `${extensionName}.keyCryptoTools.keyEncrypt`,
            title: "",
            arguments: [document, range],
        };

        const keyDecryptCodeAction = new vscode.CodeAction(
            "Decrypt text",
            vscode.CodeActionKind.RefactorRewrite
        );
        keyDecryptCodeAction.command = {
            command: `${extensionName}.keyCryptoTools.keyDecrypt`,
            title: "",
            arguments: [document, range],
        };

        return [keyEncryptCodeAction, keyDecryptCodeAction];
    }
}
