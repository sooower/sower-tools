import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new SortEnumsCodeActionProvider()
        )
    );
}

class SortEnumsCodeActionProvider implements vscode.CodeActionProvider {
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        const sortEnumsCodeAction = new vscode.CodeAction(
            "Sort enums",
            vscode.CodeActionKind.RefactorRewrite
        );
        sortEnumsCodeAction.command = {
            command: `${extensionName}.sortEnums`,
            title: "",
            arguments: [document, range],
        };

        return [sortEnumsCodeAction];
    }
}
