import { subscribeCommandsRegistry } from "./commands";
import { subscribeEventListeners } from "./eventListeners";
import { vscode } from "./shared";
import { init } from "./shared/init";
import { showDefaultOpenedDocument } from "./showDefaultOpenedDocument";

export async function activate(context: vscode.ExtensionContext) {
    try {
        init(context);

        await showDefaultOpenedDocument();

        subscribeCommandsRegistry();
        subscribeEventListeners();
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(`${e}`);
    }
}

export function deactivate() {}
