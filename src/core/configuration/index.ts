import { vscode } from "..";
import { extensionCtx, extensionName } from "../context";
import { moduleManager } from "../moduleManager";

/**
 * Initialize extension configuration synchronization.
 *
 * When any of the extension configuration (in ${projectRootDir}/.vscode/settings.json or workspace settings.json file) is changed,
 * the configuration will be reloaded.
 */
export async function initializeConfigurations() {
    await reloadConfiguration();
    registerOnDidChangeConfigurationListener();
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

                await moduleManager.reloadConfiguration();
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

function registerOnDidChangeConfigurationListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async event => {
            try {
                if (!event.affectsConfiguration(extensionName)) {
                    return;
                }

                await reloadConfiguration();
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(
                    `Error while reloading configuration. ${e}`
                );
            }
        })
    );
}
