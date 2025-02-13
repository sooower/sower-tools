import { vscode } from "@/shared";
import { extensionName } from "@/shared/init";

export class CommonCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.RefactorRewrite,
        vscode.CodeActionKind.Empty,
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        /* syncChangelog */

        const syncChangelogCodeAction = new vscode.CodeAction(
            "Sync changelog",
            vscode.CodeActionKind.Empty
        );
        syncChangelogCodeAction.command = {
            command: `${extensionName}.syncChangelog`,
            title: "",
            arguments: [document, range],
        };

        /* keyCryptoToolsKey */

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

        return [
            syncChangelogCodeAction,
            keyEncryptCodeAction,
            keyDecryptCodeAction,
        ];
    }
}
