import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";

import { CommonCodeActionProvider } from "./commonCodeActionProvider";
import { TypeScriptCodeActionProvider } from "./typescriptCodeActionProvider";

export function subscribeCodeActionProviders() {
    const typescriptProvider = vscode.languages.registerCodeActionsProvider(
        "typescript",
        new TypeScriptCodeActionProvider(),
        {
            providedCodeActionKinds:
                TypeScriptCodeActionProvider.providedCodeActionKinds,
        }
    );

    extensionCtx.subscriptions.push(typescriptProvider);

    const commonProvider = vscode.languages.registerCodeActionsProvider(
        "*", // Means all languages
        new CommonCodeActionProvider(),
        {
            providedCodeActionKinds:
                TypeScriptCodeActionProvider.providedCodeActionKinds,
        }
    );

    extensionCtx.subscriptions.push(commonProvider);
}
