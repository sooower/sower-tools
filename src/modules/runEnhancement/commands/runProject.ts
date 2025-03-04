import path from "node:path";

import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import {
    getWorkspaceFolderPath,
    getWorkspaceRelativePath,
} from "@/utils/vscode";
import { execCommand } from "@utils/command";

export function registerCommandRunProject() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.runEnhancement.runProject`,
            async () => {
                try {
                    await runProject();
                } catch (e) {
                    logger.error("Failed to run project.", e);
                }
            }
        )
    );
}

async function runProject() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    if (!fs.existsSync(path.join(workspaceFolderPath, "tsconfig.json"))) {
        return;
    }

    // Suggest to install 'tsx' if it is not installed in npm global path

    const tsxVersion = await execCommand({
        command: `tsx -v | awk '/tsx/ {print $2}'`,
        cwd: workspaceFolderPath,
    });

    if (/^v\d+\.\d+\.\d+$/.test(tsxVersion ?? "")) {
        const confirm = await vscode.window.showWarningMessage(
            `The 'tsx' is not installed in npm global path. Do you want to install it?`,
            "Install",
            "Cancel"
        );

        if (confirm === "Install") {
            await vscode.window.withProgress(
                {
                    title: "Installing 'tsx'...",
                    location: vscode.ProgressLocation.Notification,
                },
                async () => {
                    try {
                        await execCommand({
                            command: "npm install -g tsx",
                            cwd: workspaceFolderPath,
                        });
                        logger.info("'tsx' installed successfully.");
                    } catch (e) {
                        logger.error("Failed to install 'tsx'.", e);
                    }
                }
            );
        }
    }

    // Run project with 'tsx'

    const runFilePath = path.join(workspaceFolderPath, "src/index.ts");

    if (!fs.existsSync(runFilePath)) {
        logger.warn(
            `Not found project entry file "${getWorkspaceRelativePath(
                runFilePath
            )}".`,
            "Only supports 'src/index.ts' as project entry file for now!"
        );

        return;
    }

    let terminal = vscode.window.terminals.find(it =>
        it.name.includes("Run Project")
    );

    if (terminal === undefined) {
        terminal = vscode.window.createTerminal("Run Project");
    }
    terminal.sendText(`tsx ${runFilePath}`);
    terminal.show();
}
