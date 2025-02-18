import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { createSourceFileByDocument } from "@/utils/vscode";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                if (!isCurrentFileOnlyContainsEnumsDeclarations(document)) {
                    return [];
                }

                const sortEnumsCodeAction = new vscode.CodeAction(
                    "Sort enums declaration",
                    vscode.CodeActionKind.QuickFix
                );
                sortEnumsCodeAction.command = {
                    command: `${extensionName}.sortEnumsDeclaration`,
                    title: "",
                    arguments: [document, range],
                };

                return [sortEnumsCodeAction];
            },
        })
    );
}

function isCurrentFileOnlyContainsEnumsDeclarations(
    document: vscode.TextDocument
): boolean {
    return createSourceFileByDocument(document).statements.every(it =>
        ts.isEnumDeclaration(it)
    );
}
