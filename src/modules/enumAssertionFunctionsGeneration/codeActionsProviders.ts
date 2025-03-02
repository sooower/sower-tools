import { SyntaxKind } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                const enumDeclaration = getEnumDeclarationInRange(
                    document,
                    range
                );
                if (enumDeclaration === undefined) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    "Generate/update enum assertion",
                    vscode.CodeActionKind.QuickFix
                );
                codeAction.command = {
                    command: `${extensionName}.generateEnumAssertionFunctions`,
                    title: "",
                    arguments: [document, enumDeclaration],
                };

                return [codeAction];
            },
        })
    );
}

function getEnumDeclarationInRange(
    document: vscode.TextDocument,
    range: vscode.Range
) {
    const enumDeclaration = project
        ?.getSourceFile(document.uri.fsPath)
        ?.getDescendantsOfKind(SyntaxKind.EnumDeclaration)
        .find(
            it =>
                it.getFullStart() <= document.offsetAt(range.start) &&
                it.getTrailingTriviaEnd() >= document.offsetAt(range.end)
        );

    return enumDeclaration;
}
