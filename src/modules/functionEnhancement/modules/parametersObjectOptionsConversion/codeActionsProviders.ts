import ts from "typescript";

import { vscode } from "@/core";
import { extensionCtx } from "@/core/context";
import { findFuncOrCtorDeclarationNodeAtOffset } from "@/utils/typescript";
import { createSourceFileByDocument } from "@/utils/vscode";

import { kCommandConvertParametersToOptionsObject } from "./consts";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider(
            "typescript",
            new ConvertParametersToObjectOptionsCodeActionProvider()
        )
    );
}

class ConvertParametersToObjectOptionsCodeActionProvider
    implements vscode.CodeActionProvider
{
    provideCodeActions(
        document: vscode.TextDocument,
        range: vscode.Range | vscode.Selection,
        context: vscode.CodeActionContext,
        token: vscode.CancellationToken
    ): vscode.ProviderResult<(vscode.CodeAction | vscode.Command)[]> {
        if (!isValidFunctionOrConstructorDeclaration(document, range)) {
            return [];
        }

        const convertParametersToOptionsObjectCodeAction =
            new vscode.CodeAction(
                "Convert parameters to options object",
                vscode.CodeActionKind.RefactorExtract
            );
        convertParametersToOptionsObjectCodeAction.command = {
            command: kCommandConvertParametersToOptionsObject,
            title: "",
            arguments: [document, range],
        };
        convertParametersToOptionsObjectCodeAction.isPreferred = true;

        return [convertParametersToOptionsObjectCodeAction];
    }
}

/**
 * Check if the cursor is in the function declaration and the function has
 * only one parameter which type is object and the parameter name is ends with
 * `Options`
 *
 * @param document - The document to check
 * @param range - The range to check
 * @returns True if the function satisfies the conditions, otherwise false
 */
function isValidFunctionOrConstructorDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
): boolean {
    const node = findFuncOrCtorDeclarationNodeAtOffset({
        sourceFile: createSourceFileByDocument(document),
        offset: document.offsetAt(range.start),
    });

    if (node === undefined) {
        return false;
    }

    if (node.parameters.length === 1) {
        return false;
    }

    const parameter = node.parameters[0];
    if (parameter.type === undefined) {
        return false;
    }

    if (ts.isTypeLiteralNode(parameter.type)) {
        return false;
    }

    if (parameter.type.getText().endsWith("Options")) {
        return false;
    }

    return true;
}
