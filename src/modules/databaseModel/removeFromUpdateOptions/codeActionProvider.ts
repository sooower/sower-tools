import { extensionCtx, extensionName, vscode } from "@/core";

import {
    checkIsColumnIgnoredInMethodOptions,
    getColumnNameByRange,
} from "../utils";

export function registerCodeActionProviderRemoveFromUpdateOptions() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            async provideCodeActions(document, range, context, token) {
                const columnName = getColumnNameByRange(document, range);
                if (columnName === undefined) {
                    return [];
                }

                const isColumnIgnoredInUpdateOptions =
                    checkIsColumnIgnoredInMethodOptions({
                        method: "update",
                        document,
                        columnName,
                    });
                if (isColumnIgnoredInUpdateOptions) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    `Remove "${columnName}" from update() options`,
                    vscode.CodeActionKind.QuickFix
                );
                codeAction.command = {
                    command: `${extensionName}.databaseModel.removeFromUpdateOptions`,
                    title: "",
                    arguments: [document, columnName],
                };

                return [codeAction];
            },
        })
    );
}
