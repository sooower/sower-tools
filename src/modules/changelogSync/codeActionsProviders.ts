import path from "node:path";

import { extensionCtx, extensionName, vscode } from "@/core";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("markdown", {
            provideCodeActions(document, range, context, token) {
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
                    arguments: [document],
                };

                return [syncChangelogCodeAction];
            },
        })
    );
}

function isChangelogFile(document: vscode.TextDocument) {
    return path.basename(document.fileName).toLowerCase() === "changelog.md";
}
