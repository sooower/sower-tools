import { extensionCtx, extensionName, vscode } from "@/core";
import { findTypeDeclarationNodeAtOffset } from "@/utils/typescript";
import { createSourceFileByDocument } from "@/utils/vscode";

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
        if (!isCursorInOptionsTypeDeclaration(document, range)) {
            return [];
        }

        const syncTypeMembersCodeAction = new vscode.CodeAction(
            "Sync type members",
            vscode.CodeActionKind.QuickFix
        );
        syncTypeMembersCodeAction.command = {
            command: `${extensionName}.functionEnhancement.syncParameterTypeMembers`,
            title: "",
            arguments: [document, range],
        };
        syncTypeMembersCodeAction.isPreferred = true;

        return [syncTypeMembersCodeAction];
    }
}

function isCursorInOptionsTypeDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
) {
    const sourceFile = createSourceFileByDocument(document);
    const node = findTypeDeclarationNodeAtOffset({
        sourceFile,
        offset: document.offsetAt(range.start),
    });

    return node !== undefined && node.name.text.endsWith("Options");
}
