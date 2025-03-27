import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { removeFromIgnoredColumns } from "../utils";

export function registerCommandAddToInsertOptions() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.addToInsertOptions`,
            async (document: vscode.TextDocument, columnName: string) => {
                try {
                    await removeFromIgnoredColumns(
                        "insert",
                        document,
                        columnName
                    );
                    await vscode.commands.executeCommand(
                        `${extensionName}.databaseModel.updateModel`,
                        document
                    );
                } catch (e) {
                    logger.error("Failed to add to insert() options.", e);
                }
            }
        )
    );
}
