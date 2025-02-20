import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandListSkippedFiles() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.listSkippedFiles`,
            async () => {
                try {
                    const skippedFiles = await execCommand({
                        command: `git ls-files -v | grep '^S'`,
                        cwd: getWorkspaceFolderPath(),
                        interactive: false,
                    });

                    await vscode.window.showTextDocument(
                        await vscode.workspace.openTextDocument({
                            content: skippedFiles,
                        })
                    );
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}
