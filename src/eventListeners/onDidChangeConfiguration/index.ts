import { vscode } from "@/shared";
import {
    extensionCtx,
    extensionName,
    reloadConfiguration,
} from "@/shared/init";

export function subscribeOnDidChangeConfigurationListener() {
    const listener = vscode.workspace.onDidChangeConfiguration(event => {
        try {
            if (!event.affectsConfiguration(`${extensionName}`)) {
                return;
            }

            reloadConfiguration();
        } catch (e) {
            console.error(e);
            vscode.window.showErrorMessage(
                `Error while reload configuration. ${e}`
            );
        }
    });

    extensionCtx.subscriptions.push(listener);
}
