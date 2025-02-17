import crypto from "node:crypto";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { textEditorUtils } from "@/utils/vscode";

import { keyCryptoToolsKey } from "../configs";
import { KeyCrypto } from "./utils";

export function registerCommandKeyEncrypt() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
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
                        key: keyCryptoToolsKey,
                    });

                    const iv = crypto.randomBytes(16);

                    await textEditorUtils.replaceTextRangeOffset({
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
        )
    );
}
