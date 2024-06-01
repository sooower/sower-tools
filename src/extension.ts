import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeGenerateModel } from "./generateModel";
import { subscribeReloadConfiguration } from "./reloadConfiguration";
import { vscode } from "./shared";
import { init } from "./shared/init";
import { subscribeShowDefaultOpenedDocument } from "./ShowDefaultOpenedDocument";
import { subscribeShowSelectedLines } from "./showSelectedLines";

export async function activate(context: vscode.ExtensionContext) {
    try {
        init(context);

        /* Add subscriptions */

        await subscribeReloadConfiguration();
        await subscribeGenerateModel();
        await subscribeShowSelectedLines();
        await subscribeDebuggingEnhancement();
        await subscribeShowDefaultOpenedDocument();
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
