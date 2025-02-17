import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { createSourceFileByDocument } from "@/utils/vscode";

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
        if (!isCurrentFileOnlyContainsEnumsDeclarations(document)) {
            return [];
        }

        const sortEnumsCodeAction = new vscode.CodeAction(
            "Sort enums",
            vscode.CodeActionKind.QuickFix
        );
        sortEnumsCodeAction.command = {
            command: `${extensionName}.sortEnums`,
            title: "",
            arguments: [document, range],
        };

        return [sortEnumsCodeAction];
    }
}

function isCurrentFileOnlyContainsEnumsDeclarations(
    document: vscode.TextDocument
): boolean {
    return createSourceFileByDocument(document).statements.every(it =>
        ts.isEnumDeclaration(it)
    );
}
