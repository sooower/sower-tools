import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "*", // All languages
            new GenerateModelCodeActionProvider()
        ),
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new UpdateModelCodeActionProvider()
        )
    );
}

class GenerateModelCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const generateModelCodeAction = new vscode.CodeAction(
            "Generate model",
            vscode.CodeActionKind.Empty
        );
        generateModelCodeAction.command = {
            command: `${extensionName}.databaseModel.generateModel`,
            title: "",
            arguments: [document, range],
        };

        return [generateModelCodeAction];
    }
}

class UpdateModelCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const updateModelCodeAction = new vscode.CodeAction(
            "Update model",
            vscode.CodeActionKind.QuickFix
        );
        updateModelCodeAction.command = {
            command: `${extensionName}.databaseModel.updateModel`,
            title: "",
            arguments: [document, range],
        };

        return [updateModelCodeAction];
    }
}
