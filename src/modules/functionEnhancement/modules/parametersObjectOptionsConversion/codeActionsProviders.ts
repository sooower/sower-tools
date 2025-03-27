import { Node } from "ts-morph";

import { extensionCtx, extensionName, project, vscode } from "@/core";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                const funcOrMethodOrCtorDeclaration =
                    findValidFuncOrMethodOrCtorDeclaration(document, range);
                if (funcOrMethodOrCtorDeclaration === undefined) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    "Convert parameters to options object",
                    vscode.CodeActionKind.RefactorExtract
                );
                codeAction.command = {
                    command: `${extensionName}.functionEnhancement.convertParametersToOptionsObject`,
                    title: "",
                    arguments: [document, funcOrMethodOrCtorDeclaration],
                };
                codeAction.isPreferred = true;

                return [codeAction];
            },
        })
    );
}

function findValidFuncOrMethodOrCtorDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
) {
    const node = project
        ?.getSourceFile(document.fileName)
        ?.getDescendants()
        .filter(
            it =>
                Node.isFunctionDeclaration(it) ||
                Node.isConstructorDeclaration(it) ||
                Node.isMethodDeclaration(it)
        )
        .find(it => {
            return (
                it.getStart() <= document.offsetAt(range.start) &&
                it.getEnd() >= document.offsetAt(range.end)
            );
        });

    if (node === undefined) {
        return;
    }

    if (
        node.getParameters().length === 1 &&
        !Node.isTypeLiteral(node.getParameters().at(0)?.getTypeNode())
    ) {
        return;
    }

    const firstParam = node.getParameters().at(0);
    if (firstParam === undefined) {
        return;
    }

    if (firstParam.getTypeNode()?.getFullText().endsWith("Options") ?? false) {
        return;
    }

    return node;
}
