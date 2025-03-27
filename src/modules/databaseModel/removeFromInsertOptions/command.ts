import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { addToIgnoredColumns } from "../utils";

export function registerCommandRemoveFromInsertOptions() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.removeFromInsertOptions`,
            async (document: vscode.TextDocument, columnName: string) => {
                try {
                    await addToIgnoredColumns("insert", document, columnName);
                    await vscode.commands.executeCommand(
                        `${extensionName}.databaseModel.updateModel`,
                        document
                    );
                } catch (e) {
                    logger.error("Failed to remove from insert() options.", e);
                }
            }
        )
    );
}
