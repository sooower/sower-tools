import { workspace } from "vscode";

import { extensionCtx, reloadConfiguration } from "../shared";

export async function subscribeReloadConfiguration() {
    const reloadConfig = workspace.onDidChangeConfiguration(() => {
        reloadConfiguration();
    });
    extensionCtx.subscriptions.push(reloadConfig);
}
