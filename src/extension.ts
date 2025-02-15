import { subscribeCommands } from "./commands";
import { registerModules } from "./modules";
import { subscribeProviders } from "./providers";
import { vscode } from "./shared";
import { initializeConfigurations } from "./shared/configuration";
import { extensionName, initializeContext } from "./shared/context";
import { init } from "./shared/init";
import { moduleManager } from "./shared/moduleManager";

export async function activate(context: vscode.ExtensionContext) {
    try {
        await init(context);

        subscribeCommands();
        subscribeProviders();

        // NOTICE: Initialize context must be called first.
        initializeContext(context);

        registerModules();

        // NOTICE: Initialize configurations must be called after registerModules.
        await initializeConfigurations();

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
