import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
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
                        vscode.window.showErrorMessage(
                            `No workspace folder found.`
                        );

                        return;
                    }

                    await execCommand({
                        command: `git push --force`,
                        cwd: workspaceFolderPath,
                        interactive: false,
                    });
                    vscode.window.showInformationMessage(
                        `Force push successfully.`
                    );
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}
