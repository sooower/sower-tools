import { ExtensionContext, window } from "vscode";

import { subscribeGenerateModel } from "./generateModel";
import { init, pluginName, subscribeReloadConfiguration } from "./shared";

export async function activate(context: ExtensionContext) {
    try {
        window.showInformationMessage(
            `Extension "${pluginName}" is now active!`
        );

        init(context);

        /* Add subscriptions */

        await subscribeReloadConfiguration();
        await subscribeGenerateModel();
    } catch (e) {
        console.error(e);
        window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
