import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

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
        const syncTypeMembers = new vscode.CodeAction(
            "Sync type members",
            vscode.CodeActionKind.RefactorRewrite
        );
        syncTypeMembers.command = {
            command: `${extensionName}.functionEnhancement.syncTypeMembers`,
            title: "",
            arguments: [document, range],
        };
        syncTypeMembers.isPreferred = true;

        return [syncTypeMembers];
    }
}
