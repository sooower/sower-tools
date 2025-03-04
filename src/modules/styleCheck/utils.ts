import { extensionCtx, vscode } from "@/core";
import { debounce } from "@/utils/common";
import { isTypeScriptFile } from "@/utils/vscode";

import { diagnoseUpdateDelay } from "./modules/shared/configs";

/**
 * Debounce the style check diagnostic update.
 *
 * @param diagnosticFunc - The function to update the diagnostic.
 */
export function debouncedStyleCheck(
    diagnosticFunc: (document: vscode.TextDocument) => Promise<void> | void
) {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            debounce(diagnosticFunc, diagnoseUpdateDelay)(document);
        }),
        vscode.workspace.onDidChangeTextDocument(e => {
            debounce(diagnosticFunc, diagnoseUpdateDelay)(e.document);
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor === undefined) {
                return;
            }

            debounce(diagnosticFunc, diagnoseUpdateDelay)(editor.document);
        })
    );
    vscode.workspace.textDocuments
        .filter(it => isTypeScriptFile(it))
        .forEach(document => {
            debounce(diagnosticFunc, diagnoseUpdateDelay)(document);
        });
}
