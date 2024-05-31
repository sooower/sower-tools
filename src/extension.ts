import { ExtensionContext, window } from "vscode";

import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeGenerateModel } from "./generateModel";
import { subscribeReloadConfiguration } from "./reloadConfiguration";
import { init } from "./shared";
import { subscribeShowSelectedLines } from "./showSelectedLines";

export async function activate(context: ExtensionContext) {
    try {
        init(context);

        /* Add subscriptions */

        await subscribeReloadConfiguration();
        await subscribeGenerateModel();
        await subscribeShowSelectedLines();
        await subscribeDebuggingEnhancement();
    } catch (e) {
        console.error(e);
        window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
