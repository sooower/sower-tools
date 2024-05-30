import { ExtensionContext, window } from "vscode";

import { registerGenerateModel } from "./generateModel";
import { init, pluginName, registerReloadConfiguration } from "./shared";

export async function activate(context: ExtensionContext) {
    try {
        window.showInformationMessage(
            `Extension "${pluginName}" is now active!`
        );

        init(context);

        await registerReloadConfiguration();
        await registerGenerateModel();
    } catch (e) {
        console.error(e);
        window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
