import path from "node:path";

import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandSkipWorkTree() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.skipWorkTree`,
            async (uri: vscode.Uri) => {
                const workspaceFolderPath = getWorkspaceFolderPath();
                if (workspaceFolderPath === undefined) {
                    return;
                }

                const relativePath = path.relative(
                    workspaceFolderPath,
                    uri.path
                );

                try {
                    await execCommand({
                        command: `git update-index --skip-worktree ${uri.path}`,
                        cwd: workspaceFolderPath,
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
