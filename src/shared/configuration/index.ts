import { vscode } from "..";
import { moduleManager } from "../module";

let workspaceConfig: vscode.WorkspaceConfiguration;
let userConfig: vscode.WorkspaceConfiguration;

export async function reloadConfiguration() {
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

                moduleManager.reloadConfiguration();
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
