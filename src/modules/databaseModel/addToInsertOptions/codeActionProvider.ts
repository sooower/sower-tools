import { extensionCtx, extensionName, vscode } from "@/core";

import {
    checkIsColumnIgnoredInMethodOptions,
    getColumnNameByRange,
} from "../utils";

export function registerCodeActionProviderAddToInsertOptions() {
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
                        includeGlobalIgnoredColumns: false,
                    });
                if (isColumnIgnoredInInsertOptions) {
                    const codeAction = new vscode.CodeAction(
                        `Add "${columnName}" to insert() options`,
                        vscode.CodeActionKind.QuickFix
                    );
                    codeAction.command = {
                        command: `${extensionName}.databaseModel.addToInsertOptions`,
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
