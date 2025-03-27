import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { addToIgnoredColumns } from "../utils";

export function registerCommandRemoveFromUpdateOptions() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.removeFromUpdateOptions`,
            async (document: vscode.TextDocument, columnName: string) => {
                try {
                    await addToIgnoredColumns("update", document, columnName);
                    await vscode.commands.executeCommand(
                        `${extensionName}.databaseModel.updateModel`,
                        document
                    );
                } catch (e) {
                    logger.error("Failed to remove from update() options.", e);
                }
            }
        )
    );
}
