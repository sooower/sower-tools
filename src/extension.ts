import { vscode } from "./core";
import { initializeConfigurations } from "./core/configuration";
import { extensionName, initializeContext } from "./core/context";
import { moduleManager } from "./core/moduleManager";
import { modules } from "./modules";

export async function activate(context: vscode.ExtensionContext) {
    try {
        // NOTICE: Initialize context must be called first.
        initializeContext(context);

        moduleManager.registerModules(modules);

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
