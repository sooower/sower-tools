import crypto from "crypto";

import { vscode } from "@/shared";
import { extensionCtx, extensionName, keyCryptoToolsKey } from "@/shared/init";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

import KeyCrypto from "./KeyCrypto";

export function subscribeKeyEncrypt() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.keyCryptoTools.keyEncrypt`,
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

                const iv = crypto.randomBytes(16);

                await TextEditorUtils.replaceTextRangeOffset({
                    editor,
                    start: editor.document.offsetAt(editor.selection.start),
                    end: editor.document.offsetAt(editor.selection.end),
                    newText: keydecrypt.encrypt(iv, selectedText),
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}
