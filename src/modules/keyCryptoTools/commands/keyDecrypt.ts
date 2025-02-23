import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { textEditorUtils } from "@/utils/vscode";

import { keyCryptoToolsKey } from "../configs";
import { KeyCrypto } from "./utils";

export function registerCommandKeyDecrypt() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
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
                        key: keyCryptoToolsKey,
                    });

                    await textEditorUtils.replaceTextRangeOffset({
                        editor,
                        start: editor.document.offsetAt(editor.selection.start),
                        end: editor.document.offsetAt(editor.selection.end),
                        newText: keydecrypt
                            .decrypt({ text: selectedText })
                            .plaintext.toString(),
                    });
                } catch (e) {
                    logger.error("Failed to decrypt key.", e);
                }
            }
        )
    );
}
