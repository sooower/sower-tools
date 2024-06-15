import { subscribeCommands } from "./commands";
import { subscribeEventListeners } from "./eventListeners";
import { subscribeProviders } from "./providers";
import { vscode } from "./shared";
import { init } from "./shared/init";
import { showDefaultOpenedDocument } from "./showDefaultOpenedDocument";

export async function activate(context: vscode.ExtensionContext) {
    try {
        init(context);

        await showDefaultOpenedDocument();

        subscribeCommands();
        subscribeEventListeners();
        subscribeProviders();
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
