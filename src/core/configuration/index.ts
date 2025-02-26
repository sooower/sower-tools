import { logger, vscode } from "..";
import { extensionCtx, extensionName } from "../context";
import { moduleManager } from "../moduleManager";

/**
 * Initialize extension configuration synchronization.
 *
 * When any of the extension configuration (in ${projectRootDir}/.vscode/settings.json or global settings.json file) is changed,
 * the configuration will be reloaded.
 */
export async function initializeConfigurations() {
    await reloadConfiguration();
    registerOnDidChangeConfigurationListener();
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
                logger.error(`Error while reloading configuration.`, e);
            }
        })
    );
}

let workspaceConfig: vscode.WorkspaceConfiguration;
let globalConfig: vscode.WorkspaceConfiguration;

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
                globalConfig = vscode.workspace.getConfiguration();

                await moduleManager.reloadConfiguration();
            } catch (e) {
                logger.error(`Load configuration failed.`, e);
            }
        }
    );
}

/**
 * Get a workspace configuration item from the workspace settings and the global settings.
 * @param section Configuration section name, supports dotted name.
 * @returns The value of the configuration item.
 */
export function getConfigurationItem(section: string): unknown {
    return workspaceConfig.get(section) ?? globalConfig.get(section);
}

/**
 * Update a workspace configuration item.
 * @param section Configuration section name, supports dotted name.
 * @param value The value of the configuration item.
 * @param target The target of the configuration item. Default is {@link vscode.ConfigurationTarget.Global}.
 */
export async function updateConfigurationItem(
    section: string,
    value: unknown,
    target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
) {
    await vscode.workspace.getConfiguration().update(section, value, target);
}
