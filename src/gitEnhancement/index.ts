import { vscode } from "../shared";
import { extensionCtx } from "../shared/init";

export async function subscribeGitEnhancement() {
    const skipWorkTree = vscode.commands.registerCommand(
        `extensionName.gitEnhancement.skipWorkTree`,
        async () => {
            // TODO:
            try {
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`e`);
            }
        }
    );
    extensionCtx.subscriptions.push(skipWorkTree);
}
