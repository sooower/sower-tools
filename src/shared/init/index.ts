import path from "node:path";

import { CommonUtils } from "@utils/common";

import { fs, vscode } from "../";

export let extensionCtx: vscode.ExtensionContext;
export let extensionName: string;

export async function init(context: vscode.ExtensionContext) {
    const packageJsonContent = JSON.parse(
        fs.readFileSync(
            path.join(context.extensionPath, "package.json"),
            "utf-8"
        )
    );
    extensionCtx = context;
    extensionName = CommonUtils.mandatory(packageJsonContent.name);

    await reloadConfiguration();
}

let workspaceConfig: vscode.WorkspaceConfiguration;
let userConfig: vscode.WorkspaceConfiguration;

async function reloadConfiguration() {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            title: "Loading configuration",
            cancellable: false,
        },
        async (progress, token) => {
            try {
                workspaceConfig = vscode.workspace.getConfiguration(
                    undefined,
                    vscode.Uri.file(".vscode/settings.json")
                );
                userConfig = vscode.workspace.getConfiguration();
            } catch (error) {
                vscode.window.showErrorMessage(
                    `Load configuration failed: ${(error as Error).message}`
                );
            }
        }
    );
}

export function getConfigurationItem(name: string): unknown {
    return workspaceConfig.get(name) ?? userConfig.get(name);
}
