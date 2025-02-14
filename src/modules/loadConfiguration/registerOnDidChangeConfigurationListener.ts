import { vscode } from "@/shared";
import { reloadConfiguration } from "@/shared/configuration";
import { extensionCtx, extensionName } from "@/shared/context";

export function registerOnDidChangeConfigurationListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidChangeConfiguration(async event => {
            try {
                if (!event.affectsConfiguration(`${extensionName}`)) {
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
