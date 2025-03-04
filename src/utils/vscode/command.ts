import { extensionCtx, vscode } from "@/core";

/**
 * Set the extension context variable.
 *
 * @param key - The key of the extension context variable.
 * @param val - The value of the extension context variable.
 */
export async function setContext(key: string, val: unknown) {
    extensionCtx.subscriptions.push(
        await vscode.commands.executeCommand("setContext", key, val)
    );
}
