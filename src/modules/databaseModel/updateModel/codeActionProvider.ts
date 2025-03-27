import { extensionCtx, extensionName, project, vscode } from "@/core";

export function registerCodeActionProviderUpdateModel() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            async provideCodeActions(document, range, context, token) {
                if (!isCursorInTDefinitionsDeclaration(document, range)) {
                    return [];
                }

                const codeAction = new vscode.CodeAction(
                    "Update model",
                    vscode.CodeActionKind.QuickFix
                );
                codeAction.command = {
                    command: `${extensionName}.databaseModel.updateModel`,
                    title: "",
                    arguments: [document],
                };

                return [codeAction];
            },
        })
    );
}

function isCursorInTDefinitionsDeclaration(
    document: vscode.TextDocument,
    range: vscode.Range | vscode.Selection
) {
    const node = project
        ?.getSourceFile(document.fileName)
        ?.getTypeAlias("TDefinitions");

    if (node === undefined) {
        return false;
    }

    if (node.getStart() > document.offsetAt(range.start)) {
        return false;
    }

    if (node.getEnd() < document.offsetAt(range.end)) {
        return false;
    }

    return true;
}
