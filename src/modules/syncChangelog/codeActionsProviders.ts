import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";

import { kCommandSyncChangelog } from "./consts";

export function registerCodeActionsProvider() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "markdown",
            new SyncChangelogCodeActionProvider()
        )
    );
}

class SyncChangelogCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const syncChangelogCodeAction = new vscode.CodeAction(
            "Sync changelog",
            vscode.CodeActionKind.Empty
        );
        syncChangelogCodeAction.command = {
            command: kCommandSyncChangelog,
            title: "",
            arguments: [document, range],
        };

        return [syncChangelogCodeAction];
    }
}
