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
        /* generateTypeSchema */

        const generateTypeSchemaCodeAction = new vscode.CodeAction(
            "Generate Type of Schema",
            vscode.CodeActionKind.Empty
        );
        generateTypeSchemaCodeAction.command = {
            command: `${extensionName}.generateTypeSchema`,
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

        return [generateTypeSchemaCodeAction, updateModelCodeAction];
    }
}
