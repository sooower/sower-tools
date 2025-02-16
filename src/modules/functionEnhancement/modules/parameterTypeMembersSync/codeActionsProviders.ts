import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";
import { findTypeDeclarationNodeAtOffset } from "@/shared/utils/tsUtils";
import { createSourceFileByDocument } from "@/shared/utils/vscode";

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
        if (!isCursorInOptionsTypeDeclaration(document, range)) {
            return [];
        }

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
