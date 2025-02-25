import path from "node:path";

import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandNoSkipWorkTree() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.noSkipWorkTree`,
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
                        command: `git update-index --no-skip-worktree ${uri.path}`,
                        cwd: workspaceFolderPath,
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
