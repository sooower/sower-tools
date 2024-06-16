import { execSync } from "node:child_process";

import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import CommonUtils from "@/shared/utils/commonUtils";

const kTerminalName = "Temp";

export async function subscribeGitEnhancement() {
    /* Subscribe command of skip work tree */

    const skipWorkTree = vscode.commands.registerCommand(
        `${extensionName}.gitEnhancement.skipWorkTree`,
        (uri: vscode.Uri) => {
            try {
                execCommand(`git update-index --skip-worktree ${uri.path}`);
                vscode.window.showInformationMessage(
                    `Skipped work tree for file "${uri.path}".`
                );
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(skipWorkTree);

    /* Subscribe command of no skip work tree */

    const noSkipWorkTree = vscode.commands.registerCommand(
        `${extensionName}.gitEnhancement.noSkipWorkTree`,
        (uri: vscode.Uri) => {
            try {
                execCommand(`git update-index --no-skip-worktree ${uri.path}`);
                vscode.window.showInformationMessage(
                    `Recovery to track changes for file "${uri.path}".`
                );
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(noSkipWorkTree);

    /* Subscribe command of git ls-files -v */

    const listFiles = vscode.commands.registerCommand(
        `${extensionName}.gitEnhancement.listFiles`,
        () => {
            const terminal = createTempTerminal();
            terminal.sendText(`git ls-files -v`);
        }
    );
    extensionCtx.subscriptions.push(listFiles);
}

function execCommand(command: string) {
    const [workspaceFolder] = CommonUtils.mandatory(
        vscode.workspace.workspaceFolders
    );

    return execSync(command, { cwd: workspaceFolder.uri.path }).toString();
}

let terminal: vscode.Terminal;

function createTempTerminal() {
    terminal =
        vscode.window.terminals.find((it) => it.name === kTerminalName) ??
        vscode.window.createTerminal(kTerminalName);
    terminal.show();

    return terminal;
}
