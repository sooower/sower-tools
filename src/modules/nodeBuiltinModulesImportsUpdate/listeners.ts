import { extensionCtx, logger, project, vscode } from "@/core";
import { isTypeScriptFile } from "@/utils/vscode";
import { buildRangeByNode } from "@/utils/vscode/range";

import {
    enableUpdateNodeBuiltinModulesImports,
    nodeBuiltinModules,
} from "./configs";

export function registerOnDidSaveTextDocumentListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async document => {
            try {
                if (!isTypeScriptFile(document)) {
                    return;
                }

                if (enableUpdateNodeBuiltinModulesImports) {
                    await refactorNodeBuiltinModulesImports(document);
                }
            } catch (e) {
                logger.error(
                    "Failed to update node builtin modules imports with prefix.",
                    e
                );
            }
        })
    );
}

/**
 * Update node builtin modules imports with prefix "node:".
 */
export async function refactorNodeBuiltinModulesImports(
    document: vscode.TextDocument
) {
    const workspaceEdit = new vscode.WorkspaceEdit();
    project
        ?.getSourceFile(document.uri.fsPath)
        ?.getImportDeclarations()
        .forEach(it => {
            const moduleName = it.getModuleSpecifier().getLiteralValue();
            if (
                nodeBuiltinModules.includes(moduleName) &&
                !moduleName.startsWith("node:")
            ) {
                workspaceEdit.replace(
                    document.uri,
                    buildRangeByNode(document, it.getModuleSpecifier()),
                    `"node:${moduleName}"`
                );
            }
        });

    await vscode.workspace.applyEdit(workspaceEdit);
}
