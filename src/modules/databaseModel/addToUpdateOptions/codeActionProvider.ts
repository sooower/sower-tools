import { extensionCtx, extensionName, vscode } from "@/core";

import {
    checkIsColumnIgnoredInMethodOptions,
    getColumnNameByRange,
} from "../utils";

export function registerCodeActionProviderAddToUpdateOptions() {
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
                        includeGlobalIgnoredColumns: false,
                    });
                if (isColumnIgnoredInUpdateOptions) {
                    const codeAction = new vscode.CodeAction(
                        `Add "${columnName}" to update() options`,
                        vscode.CodeActionKind.QuickFix
                    );
                    codeAction.command = {
                        command: `${extensionName}.databaseModel.addToUpdateOptions`,
                        title: "",
                        arguments: [document, columnName],
                    };

                    return [codeAction];
                }

                return [];
            },
        })
    );
}
