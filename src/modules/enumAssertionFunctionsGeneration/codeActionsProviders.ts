import { SyntaxKind } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";

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
        if (!hasEnumDeclarationInRange(document, range)) {
            return [];
        }

        const generateEnumAssertionFunctionsCodeAction = new vscode.CodeAction(
            "Generate/update enum assertion",
            vscode.CodeActionKind.QuickFix
        );
        generateEnumAssertionFunctionsCodeAction.command = {
            command: `${extensionName}.generateEnumAssertionFunctions`,
            title: "",
        };

        return [generateEnumAssertionFunctionsCodeAction];
    }
}

function hasEnumDeclarationInRange(
    document: vscode.TextDocument,
    range: vscode.Range
) {
    const enumDeclarationInRange = project
        ?.getSourceFile(document.uri.fsPath)
        ?.getDescendantsOfKind(SyntaxKind.EnumDeclaration)
        .some(
            it =>
                it.getFullStart() <= range.start.line &&
                it.getTrailingTriviaEnd() >= range.end.line
        );

    return enumDeclarationInRange ?? false;
}
