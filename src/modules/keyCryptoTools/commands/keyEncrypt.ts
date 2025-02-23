import crypto from "node:crypto";

import { extensionCtx, extensionName, logger, vscode } from "@/core";
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
                    logger.error("Failed to encrypt key.", e);
                }
            }
        )
    );
}
