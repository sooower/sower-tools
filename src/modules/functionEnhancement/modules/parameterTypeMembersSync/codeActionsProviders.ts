import { SyntaxKind } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";
import { isNodeInRange } from "@/utils/vscode";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions: (document, range, context, token) => {
                const typeDeclaration = findInRangeOptionsTypeDeclaration(
                    document,
                    range
                );
                if (typeDeclaration === undefined) {
                    return [];
                }

                const syncTypeMembersCodeAction = new vscode.CodeAction(
                    "Sync type members",
                    vscode.CodeActionKind.QuickFix
                );
                syncTypeMembersCodeAction.command = {
                    command: `${extensionName}.functionEnhancement.syncParameterTypeMembers`,
                    title: "",
                    arguments: [document, typeDeclaration],
                };
                syncTypeMembersCodeAction.isPreferred = true;

                return [syncTypeMembersCodeAction];
            },
        })
    );
}

function findInRangeOptionsTypeDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
) {
    return project
        ?.getSourceFile(document.fileName)
        ?.getDescendantsOfKind(SyntaxKind.TypeAliasDeclaration)
        .find(
            node =>
                isNodeInRange(document, range, node) &&
                node.getName().endsWith("Options")
        );
}
