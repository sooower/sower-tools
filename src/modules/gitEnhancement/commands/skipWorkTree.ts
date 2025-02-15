import path from "node:path";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";
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

                    vscode.window.showInformationMessage(
                        `Skipped work tree for file "${relativePath}".`
                    );
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}
