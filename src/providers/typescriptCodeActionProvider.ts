import { vscode } from "../shared";
import { extensionCtx, extensionName } from "../shared/init";

export function subscribeCodeActionProviders() {
    const provider = vscode.languages.registerCodeActionsProvider(
        "typescript",
        new TypeScriptCodeActionProvider(),
        {
            providedCodeActionKinds:
                TypeScriptCodeActionProvider.providedCodeActionKinds,
        }
    );

    extensionCtx.subscriptions.push(provider);
}

class TypeScriptCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.RefactorRewrite,
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

        const covertTimestampCodeAction = new vscode.CodeAction(
            "Convert timestamp",
            vscode.CodeActionKind.RefactorRewrite
        );
        covertTimestampCodeAction.command = {
            command: `${extensionName}.timestampTool.covertTimestamp`,
            title: "",
            arguments: [document, range],
        };

        const insertTimestampCodeAction = new vscode.CodeAction(
            "Insert timestamp",
            vscode.CodeActionKind.QuickFix
        );
        insertTimestampCodeAction.command = {
            command: `${extensionName}.timestampTool.insertTimestamp`,
            title: "",
            arguments: [document, range],
        };

        return [
            convertParametersToOptionsObject,
            generateEnumAssertionFunctionCodeAction,
            updateModelCodeAction,
            covertTimestampCodeAction,
            insertTimestampCodeAction,
        ];
    }
}
