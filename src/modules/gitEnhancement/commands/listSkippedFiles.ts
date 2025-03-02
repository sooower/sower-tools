import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandListSkippedFiles() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.listSkippedFiles`,
            async () => {
                try {
                    const workspaceFolderPath = getWorkspaceFolderPath();
                    if (workspaceFolderPath === undefined) {
                        return;
                    }

                    const skippedFiles = await execCommand({
                        command: `git ls-files -v | grep '^S' || echo ''`,
                        cwd: workspaceFolderPath,
                        interactive: false,
                    });

                    if (skippedFiles?.length === 0) {
                        logger.info("No skipped files found.");

                        return;
                    }

                    await vscode.window.showTextDocument(
                        await vscode.workspace.openTextDocument({
                            content: skippedFiles,
                        })
                    );
                } catch (e) {
                    logger.error("Failed to list skipped files.", e);
                }
            }
        )
    );
}
