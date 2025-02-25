import { extensionCtx, vscode } from "@/core";

import { kGenerateModelCodeAction } from "./consts";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("*", {
            provideCodeActions(document, range, context, token) {
                if (!isCursorInCreateTable(document, range)) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    "Generate model",
                    vscode.CodeActionKind.RefactorExtract
                );
                codeAction.command = {
                    command: kGenerateModelCodeAction,
                    title: "",
                    arguments: [document, range],
                };

                return [codeAction];
            },
        })
    );
}

function isCursorInCreateTable(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
) {
    return document
        .getText(range)
        .trim()
        .toUpperCase()
        .startsWith("CREATE TABLE");
}
