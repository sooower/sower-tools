import path from "node:path";

import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandNoSkipWorkTree() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.noSkipWorkTree`,
            async (uri: vscode.Uri) => {
                const relativePath = path.relative(
                    getWorkspaceFolderPath(),
                    uri.path
                );

                try {
                    await execCommand({
                        command: `git update-index --no-skip-worktree ${uri.path}`,
                        cwd: getWorkspaceFolderPath(),
                    });
                    logger.info(
                        `Recovery to track changes for file "${relativePath}".`
                    );
                } catch (e) {
                    logger.error(
                        "Failed to recovery to track changes for file.",
                        e
                    );
                }
            }
        )
    );
}
