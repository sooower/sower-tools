import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";

import { kCommandConvertTimestamp, kCommandInsertTimestamp } from "./consts";

export function registerCodeActionsProvider() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "*", // All languages
            new TimestampCodeActionProvider()
        )
    );
}

export class TimestampCodeActionProvider implements vscode.CodeActionProvider {
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
            command: kCommandConvertTimestamp,
            title: "",
            arguments: [document, range],
        };

        const insertTimestampCodeAction = new vscode.CodeAction(
            "Insert timestamp",
            vscode.CodeActionKind.Empty
        );
        insertTimestampCodeAction.command = {
            command: kCommandInsertTimestamp,
            title: "",
            arguments: [document, range],
        };

        return [covertTimestampCodeAction, insertTimestampCodeAction];
    }
}
