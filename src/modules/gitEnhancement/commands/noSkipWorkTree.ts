import path from "node:path";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandNoSkipWorkTree() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.noSkipWorkTree`,
            (uri: vscode.Uri) => {
                const relativePath = path.relative(
                    getWorkspaceFolderPath(),
                    uri.path
                );

                try {
                    execCommand({
                        command: `git update-index --no-skip-worktree ${uri.path}`,
                        cwd: getWorkspaceFolderPath(),
                    });
                    vscode.window.showInformationMessage(
                        `Recovery to track changes for file "${relativePath}".`
                    );
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}
