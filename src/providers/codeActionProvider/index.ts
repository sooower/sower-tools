import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";

import { CommonCodeActionProvider } from "./commonCodeActionProvider";

export function subscribeCodeActionProviders() {
    const commonProvider = vscode.languages.registerCodeActionsProvider(
        "*", // Means all languages
        new CommonCodeActionProvider()
    );

    extensionCtx.subscriptions.push(commonProvider);
}
