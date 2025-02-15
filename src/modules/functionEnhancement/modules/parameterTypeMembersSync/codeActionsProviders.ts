import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";

import { kCommandSyncParameterTypeMembers } from "./consts";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new SyncTypeMembersCodeActionProvider()
        )
    );
}

class SyncTypeMembersCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const syncTypeMembersCodeAction = new vscode.CodeAction(
            "Sync type members",
            vscode.CodeActionKind.QuickFix
        );
        syncTypeMembersCodeAction.command = {
            command: kCommandSyncParameterTypeMembers,
            title: "",
            arguments: [document, range],
        };
        syncTypeMembersCodeAction.isPreferred = true;

        return [syncTypeMembersCodeAction];
    }
}
