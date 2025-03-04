import { Node } from "ts-morph";

import { extensionCtx, project, vscode } from "@/core";
import { buildRangeByOffsets } from "@/utils/vscode/range";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("typescript", {
            provideCodeActions(document, range, context, token) {
                const sourceFile = project?.getSourceFile(document.fileName);
                if (sourceFile === undefined) {
                    return [];
                }

                const isContainsNonEnumDeclarations = sourceFile
                    .getStatements()
                    .some(it => !Node.isEnumDeclaration(it));
                if (isContainsNonEnumDeclarations) {
                    return [];
                }

                // Replace the top level enums declaration of the current file with the sorted enums declaration.

                const sortedEnumsDeclarationsTexts =
                    sourceFile
                        .getEnums()
                        .sort((a, b) => a.getName().localeCompare(b.getName()))
                        .map(node => node.getFullText().trim())
                        .join("\n\n") + "\n";

                const codeAction = new vscode.CodeAction(
                    "Sort enums declaration",
                    vscode.CodeActionKind.QuickFix
                );
                codeAction.edit = new vscode.WorkspaceEdit();
                codeAction.edit.replace(
                    document.uri,
                    buildRangeByOffsets(document, 0, document.getText().length),
                    sortedEnumsDeclarationsTexts
                );

                return [codeAction];
            },
        })
    );
}
