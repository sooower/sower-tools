import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new GenerateTypeOfZodSchemaCodeActionProvider()
        )
    );
}

class GenerateTypeOfZodSchemaCodeActionProvider
    implements vscode.CodeActionProvider
{
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const generateTypeSchemaCodeAction = new vscode.CodeAction(
            "Generate type declaration of zod schema",
            vscode.CodeActionKind.QuickFix
        );
        generateTypeSchemaCodeAction.command = {
            command: `${extensionName}.generateTypeOfZodSchema`,
            title: "",
            arguments: [document, range],
        };

        return [generateTypeSchemaCodeAction];
    }
}
