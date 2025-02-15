import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new GenerationEnumAssertionFunctionsCodeActionProvider()
        )
    );
}

class GenerationEnumAssertionFunctionsCodeActionProvider
    implements vscode.CodeActionProvider
{
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const generateEnumAssertionFunctionsCodeAction = new vscode.CodeAction(
            "Generate/update enum assertion",
            vscode.CodeActionKind.QuickFix
        );
        generateEnumAssertionFunctionsCodeAction.command = {
            command: `${extensionName}.generateEnumAssertionFunctions`,
            title: "",
            arguments: [document, range],
        };

        return [generateEnumAssertionFunctionsCodeAction];
    }
}
