import { extensionCtx, vscode } from "@/core";
import { debounce } from "@/utils/common";
import { isTypeScriptFile } from "@/utils/vscode";

const kCheckColumnsStatusDelay = 200;

/**
 * Debounce the check columns status.
 *
 * @param fn - The function to check columns status.
 */
export function debouncedCheckColumnsStatus(
    fn: (document: vscode.TextDocument) => Promise<void> | void
) {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(document => {
            debounce(fn, kCheckColumnsStatusDelay)(document);
        }),
        vscode.workspace.onDidChangeTextDocument(e => {
            debounce(fn, kCheckColumnsStatusDelay)(e.document);
        }),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor === undefined) {
                return;
            }

            debounce(fn, kCheckColumnsStatusDelay)(editor.document);
        })
    );
    vscode.workspace.textDocuments
        .filter(it => isTypeScriptFile(it))
        .forEach(document => {
            debounce(fn, kCheckColumnsStatusDelay)(document);
        });
}
