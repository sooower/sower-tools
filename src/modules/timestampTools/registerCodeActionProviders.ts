import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";

import { TimestampCodeActionProvider } from "./timestampCodeActionProvider";
// import { TypeScriptCodeActionProvider } from "./typescriptCodeActionProvider";

export function registerCodeActionProviders() {
    // const typescriptProvider = vscode.languages.registerCodeActionsProvider(
    //     "typescript",
    //     new TypeScriptCodeActionProvider(),
    //     {
    //         providedCodeActionKinds:
    //             TypeScriptCodeActionProvider.providedCodeActionKinds,
    //     }
    // );

    // extensionCtx.subscriptions.push(typescriptProvider);

    const commonProvider = vscode.languages.registerCodeActionsProvider(
        "*", // Means all languages
        new TimestampCodeActionProvider()
        // {
        //     providedCodeActionKinds:
        //         TimestampCodeActionProvider.providedCodeActionKinds,
        // }
    );

    extensionCtx.subscriptions.push(commonProvider);
}
