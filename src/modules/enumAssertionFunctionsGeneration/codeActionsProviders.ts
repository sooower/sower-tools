import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { findEnumDeclarationNodeAtOffset } from "@/shared/utils/typescript";
import { createSourceFileByDocument } from "@/shared/utils/vscode";

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
        if (!isCursorInEnumDeclaration(document, range)) {
            return [];
        }

        const generateEnumAssertionFunctionsCodeAction = new vscode.CodeAction(
            "Generate/update enum assertion",
            vscode.CodeActionKind.QuickFix
        );
        generateEnumAssertionFunctionsCodeAction.command = {
            command: `${extensionName}.generateEnumAssertionFunctions`,
            title: "",
            arguments: [document, range],
        };

        return [generateEnumAssertionFunctionsCodeAction];
    }
}

function isCursorInEnumDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range
): boolean {
    const sourceFile = createSourceFileByDocument(document);
    const node = findEnumDeclarationNodeAtOffset({
        sourceFile,
        offset: document.offsetAt(range.start),
    });

    return node !== undefined;
}
