import { subscribeCommands } from "./commands";
import { subscribeEventListeners } from "./eventListeners";
import { executeOnExtensionActive } from "./executeOnExtensionActive";
import { executeOnExtensionDeactive } from "./executeOnExtensionDeactive";
import { registerMarkdown } from "./modules/markdown";
import { subscribeProviders } from "./providers";
import { vscode } from "./shared";
import { extensionName, init } from "./shared/init";

export async function activate(context: vscode.ExtensionContext) {
    try {
        init(context);

        executeOnExtensionActive();

        subscribeCommands();
        subscribeEventListeners();
        subscribeProviders();

        registerMarkdown();

        console.log(`${extensionName} is now active!`);
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(
            `Error while initializing extension. ${e}`
        );
    }
}

export function deactivate() {
    executeOnExtensionDeactive();

    console.log(`${extensionName} is now deactive!`);
}
