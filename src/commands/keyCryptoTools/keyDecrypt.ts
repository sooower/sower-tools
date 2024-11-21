import { vscode } from "@/shared";
import { extensionCtx, extensionName, keyCryptoToolsKey } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

import { KeyCrypto } from "./utils";

export function subscribeKeyDecrypt() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.keyCryptoTools.keyDecrypt`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                const selectedText = editor.document
                    .getText(editor.selection)
                    .trim();

                const keydecrypt = new KeyCrypto({
                    password: keyCryptoToolsKey,
                });

                await TextEditorUtils.replaceTextRangeOffset({
                    editor,
                    start: editor.document.offsetAt(editor.selection.start),
                    end: editor.document.offsetAt(editor.selection.end),
                    newText: keydecrypt
                        .decrypt({ text: selectedText })
                        .plaintext.toString(),
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}
