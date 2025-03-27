import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { removeFromIgnoredColumns } from "../utils";

export function registerCommandAddToUpdateOptions() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.addToUpdateOptions`,
            async (document: vscode.TextDocument, columnName: string) => {
                try {
                    await removeFromIgnoredColumns(
                        "update",
                        document,
                        columnName
                    );
                    await vscode.commands.executeCommand(
                        `${extensionName}.databaseModel.updateModel`,
                        document
                    );
                } catch (e) {
                    logger.error("Failed to add to update() options.", e);
                }
            }
        )
    );
}
