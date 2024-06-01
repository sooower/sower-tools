import { vscode } from "../shared";
import { extensionCtx, reloadConfiguration } from "../shared/init";

export async function subscribeReloadConfiguration() {
    const reloadConfig = vscode.workspace.onDidChangeConfiguration(() => {
        reloadConfiguration();
    });
    extensionCtx.subscriptions.push(reloadConfig);
}
