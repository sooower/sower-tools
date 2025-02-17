import { vscode } from "@/core";
import { extensionCtx } from "@/core/context";

import { kCommandConvertTimestamp, kCommandInsertTimestamp } from "./consts";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "*", // All languages
            new TimestampToolsCodeActionProvider()
        )
    );
}

class TimestampToolsCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const codeActions: (vscode.CodeAction | vscode.Command)[] = [];

        if (isSelectedContent(document, range)) {
            const covertTimestampCodeAction = new vscode.CodeAction(
                "Convert timestamp",
                vscode.CodeActionKind.RefactorRewrite
            );
            covertTimestampCodeAction.command = {
                command: kCommandConvertTimestamp,
                title: "",
                arguments: [document, range],
            };
            codeActions.push(covertTimestampCodeAction);
        }

        if (!isSelectedContent(document, range)) {
            const insertTimestampCodeAction = new vscode.CodeAction(
                "Insert timestamp",
                vscode.CodeActionKind.Empty
            );
            insertTimestampCodeAction.command = {
                command: kCommandInsertTimestamp,
                title: "",
                arguments: [document, range],
            };

            codeActions.push(insertTimestampCodeAction);
        }

        return codeActions;
    }
}

function isSelectedContent(document: vscode.TextDocument, range: vscode.Range) {
    return document.getText(range).trim() !== "";
}
