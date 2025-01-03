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
        _context: vscode.CodeActionContext,
        _token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        /* timestampTool */

        const covertTimestampCodeAction = new vscode.CodeAction(
            "Convert timestamp",
            vscode.CodeActionKind.RefactorRewrite
        );
        covertTimestampCodeAction.command = {
            command: `${extensionName}.timestampTool.covertTimestamp`,
            title: "",
            arguments: [document, range],
        };

        const insertTimestampCodeAction = new vscode.CodeAction(
            "Insert timestamp",
            vscode.CodeActionKind.Empty
        );
        insertTimestampCodeAction.command = {
            command: `${extensionName}.timestampTool.insertTimestamp`,
            title: "",
            arguments: [document, range],
        };

        /* stringTools */

        const base64EncodeCodeAction = new vscode.CodeAction(
            "Base64 encode",
            vscode.CodeActionKind.Empty
        );
        base64EncodeCodeAction.command = {
            command: `${extensionName}.stringTools.base64Encode`,
            title: "",
            arguments: [document, range],
        };

        const base64DecodeCodeAction = new vscode.CodeAction(
            "Base64 decode",
            vscode.CodeActionKind.Empty
        );
        base64DecodeCodeAction.command = {
            command: `${extensionName}.stringTools.base64Decode`,
            title: "",
            arguments: [document, range],
        };

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
            covertTimestampCodeAction,
            insertTimestampCodeAction,
            base64EncodeCodeAction,
            base64DecodeCodeAction,
            syncChangelogCodeAction,
            keyEncryptCodeAction,
            keyDecryptCodeAction,
        ];
    }
}
