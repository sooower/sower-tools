import path from "node:path";

import { extensionCtx, extensionName, vscode } from "@/core";

export function registerCodeActionsProviders() {
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
        if (!isChangelogFile(document)) {
            return [];
        }

        const syncChangelogCodeAction = new vscode.CodeAction(
            "Sync changelog",
            vscode.CodeActionKind.QuickFix
        );
        syncChangelogCodeAction.command = {
            command: `${extensionName}.changelogSync.syncChangelog`,
            title: "",
            arguments: [document, range],
        };

        return [syncChangelogCodeAction];
    }
}

function isChangelogFile(document: vscode.TextDocument) {
    return path.basename(document.fileName).toUpperCase() === "CHANGELOG.MD";
}
