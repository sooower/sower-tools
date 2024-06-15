import { vscode } from "../shared";
import { extensionCtx, extensionName } from "../shared/init";

export function subscribeCodeActionProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new TypeScriptCodeActionProvider(),
            {
                providedCodeActionKinds:
                    TypeScriptCodeActionProvider.providedCodeActionKinds,
            }
        )
    );
}

class TypeScriptCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix,
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const convertParametersToOptionsObject = new vscode.CodeAction(
            "Convert parameters to options object",
            vscode.CodeActionKind.RefactorRewrite
        );
        convertParametersToOptionsObject.command = {
            command: `${extensionName}.functionEnhancement.convertParametersToOptionsObject`,
            title: "",
            arguments: [document, range],
        };
        convertParametersToOptionsObject.isPreferred = true;

        const generateEnumAssertionFunctionCodeAction = new vscode.CodeAction(
            "Generate/update enum assertion",
            vscode.CodeActionKind.QuickFix
        );
        generateEnumAssertionFunctionCodeAction.command = {
            command: `${extensionName}.generateEnumAssertionFunction`,
            title: "",
            arguments: [document, range],
        };

        const updateModelCodeAction = new vscode.CodeAction(
            "Update model",
            vscode.CodeActionKind.QuickFix
        );
        updateModelCodeAction.command = {
            command: `${extensionName}.databaseModel.updateModel`,
            title: "",
            arguments: [document, range],
        };

        return [
            convertParametersToOptionsObject,
            generateEnumAssertionFunctionCodeAction,
            updateModelCodeAction,
        ];
    }
}
