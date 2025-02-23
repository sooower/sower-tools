import { extensionCtx, vscode } from "@/core";

import { kCommandBase64Decode, kCommandBase64Encode } from "./consts";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "*", // All languages
            new StringToolsCodeActionProvider()
        )
    );
}

class StringToolsCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        if (document.getText(range).trim() === "") {
            return [];
        }

        const base64EncodeCodeAction = new vscode.CodeAction(
            "Base64 encode",
            vscode.CodeActionKind.RefactorRewrite
        );
        base64EncodeCodeAction.command = {
            command: kCommandBase64Encode,
            title: "",
            arguments: [document, range],
        };

        const base64DecodeCodeAction = new vscode.CodeAction(
            "Base64 decode",
            vscode.CodeActionKind.RefactorRewrite
        );
        base64DecodeCodeAction.command = {
            command: kCommandBase64Decode,
            title: "",
            arguments: [document, range],
        };

        return [base64EncodeCodeAction, base64DecodeCodeAction];
    }
}
