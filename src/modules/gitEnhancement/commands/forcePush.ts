import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPathSafe } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandForcePush() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.forcePush`,
            async () => {
                try {
                    const confirm = await vscode.window.showWarningMessage(
                        "Force push will override the remote branch! Do you want to continue?",
                        { modal: true },
                        "Confirm"
                    );

                    if (confirm !== "Confirm") {
                        return;
                    }

                    const workspaceFolderPath = getWorkspaceFolderPathSafe();
                    if (workspaceFolderPath === undefined) {
                        logger.error(`No workspace folder found.`);

                        return;
                    }

                    await execCommand({
                        command: `git push --force`,
                        cwd: workspaceFolderPath,
                        interactive: false,
                    });
                    logger.info(`Force push successfully.`);
                } catch (e) {
                    logger.error("Failed to force push.", e);
                }
            }
        )
    );
}
