import { subscribeCommands } from "./commands";
import { subscribeEventListeners } from "./eventListeners";
import { executeOnExtensionActive } from "./executeOnExtensionActive";
import { registerModules } from "./modules";
import { subscribeProviders } from "./providers";
import { vscode } from "./shared";
import { extensionName, initializeContext } from "./shared/context";
import { init } from "./shared/init";
import { moduleManager } from "./shared/module";

export async function activate(context: vscode.ExtensionContext) {
    try {
        await init(context);

        executeOnExtensionActive();

        subscribeCommands();
        subscribeEventListeners();
        subscribeProviders();

        initializeContext(context);
        registerModules();
        await moduleManager.activateModules();

        console.log(`${extensionName} is now active!`);
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(
            `Error while initializing extension. ${e}`
        );
    }
}

export async function deactivate() {
    await moduleManager.deactivateModules();

    console.log(`${extensionName} is now deactive!`);
}
