import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";

import { kCommandConvertParametersToOptionsObject } from "./consts";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new ConvertParametersToObjectOptionsCodeActionProvider()
        )
    );
}

class ConvertParametersToObjectOptionsCodeActionProvider
    implements vscode.CodeActionProvider
{
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const convertParametersToOptionsObjectCodeAction =
            new vscode.CodeAction(
                "Convert parameters to options object",
                vscode.CodeActionKind.RefactorExtract
            );
        convertParametersToOptionsObjectCodeAction.command = {
            command: kCommandConvertParametersToOptionsObject,
            title: "",
            arguments: [document, range],
        };
        convertParametersToOptionsObjectCodeAction.isPreferred = true;

        return [convertParametersToOptionsObjectCodeAction];
    }
}
