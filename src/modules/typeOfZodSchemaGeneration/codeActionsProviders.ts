import { extensionCtx, extensionName, vscode } from "@/core";
import { findVariableDeclarationNodeAtOffset } from "@/utils/typescript";
import { createSourceFileByDocument } from "@/utils/vscode";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new GenerateTypeOfZodSchemaCodeActionProvider()
        )
    );
}

class GenerateTypeOfZodSchemaCodeActionProvider
    implements vscode.CodeActionProvider
{
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        if (!isZodSchemaDeclaration(document, range)) {
            return [];
        }

        const generateTypeSchemaCodeAction = new vscode.CodeAction(
            "Generate/update type of schema",
            vscode.CodeActionKind.QuickFix
        );
        generateTypeSchemaCodeAction.command = {
            command: `${extensionName}.generateTypeOfZodSchema`,
            title: "",
            arguments: [document, range],
        };

        return [generateTypeSchemaCodeAction];
    }
}

function isZodSchemaDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
) {
    const sourceFile = createSourceFileByDocument(document);
    const node = findVariableDeclarationNodeAtOffset({
        sourceFile,
        offset: document.offsetAt(range.start),
    });

    // TODO: Only check the variable name rule temporarily, we should strictly check
    // variable value type is zod schema declaration in the future.
    return node !== undefined && node.name.getText().endsWith("Schema");
}
