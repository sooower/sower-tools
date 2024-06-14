import { vscode } from "../shared";
import { extensionCtx, extensionName } from "../shared/init";

export function subscribeCodeActionProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new TypeScriptCodeActionProvider(),
            {
                providedCodeActionKinds: [
                    vscode.CodeActionKind.RefactorRewrite,
                ],
            }
        )
    );
}

class TypeScriptCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const refactorParametersCodeAction = new vscode.CodeAction(
            "Refactor Parameters Style"
        );
        refactorParametersCodeAction.command = {
            command: `${extensionName}.functionEnhancement.refactorFuncParametersToUseObjectParameter`,
            title: "",
            arguments: [document, range],
        };

        const generateEnumAssertionFunctionCodeAction = new vscode.CodeAction(
            "Generate/Update Enum Assertion"
        );
        generateEnumAssertionFunctionCodeAction.command = {
            command: `${extensionName}.generateEnumAssertionFunction`,
            title: "",
            arguments: [document, range],
        };

        const updateModelCodeAction = new vscode.CodeAction("Update Model");
        updateModelCodeAction.command = {
            command: `${extensionName}.databaseModel.updateModel`,
            title: "",
            arguments: [document, range],
        };

        return [
            refactorParametersCodeAction,
            generateEnumAssertionFunctionCodeAction,
            updateModelCodeAction,
        ];
    }
}
