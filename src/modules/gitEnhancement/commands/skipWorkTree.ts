import path from "node:path";

import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandSkipWorkTree() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.skipWorkTree`,
            async (uri: vscode.Uri) => {
                const relativePath = path.relative(
                    getWorkspaceFolderPath(),
                    uri.path
                );

                try {
                    await execCommand({
                        command: `git update-index --skip-worktree ${uri.path}`,
                        cwd: getWorkspaceFolderPath(),
                    });

                    logger.info(
                        `Skipped work tree for file "${relativePath}".`
                    );
                } catch (e) {
                    logger.error("Failed to skip work tree for file.", e);
                }
            }
        )
    );
}
