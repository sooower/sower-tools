import { subscribeCodeActionProviders } from "./codeActionsProviders";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGenerateModel } from "./generateModel";
import { subscribeReloadConfiguration } from "./reloadConfiguration";
import { vscode } from "./shared";
import { init } from "./shared/init";
import { subscribeShowDefaultOpenedDocument } from "./showDefaultOpenedDocument";
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
        await subscribeEnhanceFunction();
        await subscribeGenerateEnumAssertionFunction();
        await subscribeCodeActionProviders();
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
