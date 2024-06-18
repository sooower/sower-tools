import { vscode } from "@/shared";
import { extensionName } from "@/shared/init";

export class TypeScriptCodeActionProvider implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.RefactorRewrite,
        vscode.CodeActionKind.Empty,
    ];

    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        /* functionEnhancement */

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

        /* generateEnumAssertionFunction */

        const generateEnumAssertionFunctionCodeAction = new vscode.CodeAction(
            "Generate/update enum assertion",
            vscode.CodeActionKind.Empty
        );
        generateEnumAssertionFunctionCodeAction.command = {
            command: `${extensionName}.generateEnumAssertionFunction`,
            title: "",
            arguments: [document, range],
        };

        /* databaseModel */

        const updateModelCodeAction = new vscode.CodeAction(
            "Update model",
            vscode.CodeActionKind.Empty
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
