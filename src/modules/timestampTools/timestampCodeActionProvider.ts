import { vscode } from "@/shared";
import { extensionName } from "@/shared/init";

export class TimestampCodeActionProvider implements vscode.CodeActionProvider {
    // public static readonly providedCodeActionKinds = [
    //     vscode.CodeActionKind.RefactorRewrite,
    //     vscode.CodeActionKind.Empty,
    // ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
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

        return [covertTimestampCodeAction, insertTimestampCodeAction];
    }
}
