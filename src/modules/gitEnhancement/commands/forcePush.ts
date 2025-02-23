import { extensionCtx, extensionName, logger, vscode } from "@/core";
import {
    getWorkspaceFolderPath,
    getWorkspaceFolderPathSafe,
} from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandForcePush() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.forcePush`,
            async () => {
                try {
                    const kForcePush = "Force push";

                    const currBranch = await execCommand({
                        command: `git branch --show-current`,
                        cwd: getWorkspaceFolderPath(),
                        interactive: false,
                    });

                    const confirm = await vscode.window.showWarningMessage(
                        `Are you sure you want to force push branch '${currBranch}'? (it will override the remote branch and not be able to rollback)`,
                        { modal: true },
                        kForcePush
                    );

                    if (confirm !== kForcePush) {
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
