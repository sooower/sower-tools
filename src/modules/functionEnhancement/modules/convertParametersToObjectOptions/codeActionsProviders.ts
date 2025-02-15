import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

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
        const convertParametersToOptionsObject = new vscode.CodeAction(
            "Convert parameters to options object",
            vscode.CodeActionKind.RefactorExtract
        );
        convertParametersToOptionsObject.command = {
            command: `${extensionName}.functionEnhancement.convertParametersToOptionsObject`,
            title: "",
            arguments: [document, range],
        };
        convertParametersToOptionsObject.isPreferred = true;

        return [convertParametersToOptionsObject];
    }
}
