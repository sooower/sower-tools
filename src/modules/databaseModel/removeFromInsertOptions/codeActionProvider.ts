import { extensionCtx, extensionName, vscode } from "@/core";

import {
    checkIsColumnIgnoredInMethodOptions,
    getColumnNameByRange,
} from "../utils";

export function registerCodeActionProviderRemoveFromInsertOptions() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            async provideCodeActions(document, range, context, token) {
                const columnName = getColumnNameByRange(document, range);
                if (columnName === undefined) {
                    return [];
                }

                const isColumnIgnoredInInsertOptions =
                    checkIsColumnIgnoredInMethodOptions({
                        method: "insert",
                        document,
                        columnName,
                    });
                if (isColumnIgnoredInInsertOptions) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    `Remove "${columnName}" from insert() options`,
                    vscode.CodeActionKind.QuickFix
                );
                codeAction.command = {
                    command: `${extensionName}.databaseModel.removeFromInsertOptions`,
                    title: "",
                    arguments: [document, columnName],
                };

                return [codeAction];
            },
        })
    );
}
