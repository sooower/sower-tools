import { subscribeCommands } from "./commands";
import { subscribeEventListeners } from "./eventListeners";
import { executeOnExtensionActive } from "./executeOnExtensionActive";
import { countdownTimer } from "./modules/countdownTimer";
import { markdown } from "./modules/markdown";
import { stringTools } from "./modules/stringTools";
import { timestampTools } from "./modules/timestampTools";
import { subscribeProviders } from "./providers";
import { vscode } from "./shared";
import { extensionName, init } from "./shared/init";

export async function activate(context: vscode.ExtensionContext) {
    try {
        await init(context);

        executeOnExtensionActive();

        subscribeCommands();
        subscribeEventListeners();
        subscribeProviders();

        markdown.onActive();
        countdownTimer.onActive();
        timestampTools.onActive();
        stringTools.onActive();

        console.log(`${extensionName} is now active!`);
    } catch (e) {
        console.error(e);
        vscode.window.showErrorMessage(
            `Error while initializing extension. ${e}`
        );
    }
}

export async function deactivate(): Promise<void> {
    markdown.onDeactive();
    countdownTimer.onDeactive();
    timestampTools.onDeactive();
    stringTools.onDeactive();
    console.log(`${extensionName} is now deactive!`);
}
