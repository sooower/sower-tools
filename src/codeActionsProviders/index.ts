import { vscode } from "../shared";
import { extensionCtx } from "../shared/init";

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
            "Refactor Parameters"
        );
        refactorParametersCodeAction.command = {
            command:
                "sower-tools.functionEnhancement.refactorFuncParametersToUseObjectParameter",
            title: "Refactor Parameters",
            arguments: [document, range],
        };

        const generateEnumAssertionFunctionCodeAction = new vscode.CodeAction(
            "Generate Enum Assertion"
        );
        generateEnumAssertionFunctionCodeAction.command = {
            command: "sower-tools.generateEnumAssertionFunction",
            title: "Generate Enum Assertion",
            arguments: [document, range],
        };

        return [
            refactorParametersCodeAction,
            generateEnumAssertionFunctionCodeAction,
        ];
    }
}
