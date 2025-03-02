import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { keyCryptoToolsKey } from "../configs";
import { KeyCrypto } from "./utils";

export function registerCommandKeyDecrypt() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.keyCryptoTools.keyDecrypt`,
            async (
                document: vscode.TextDocument,
                range: vscode.Range,
                selectedText: string
            ) => {
                try {
                    const keydecrypt = new KeyCrypto({
                        key: keyCryptoToolsKey,
                    });

                    const workspaceEdit = new vscode.WorkspaceEdit();
                    workspaceEdit.replace(
                        document.uri,
                        range,
                        keydecrypt
                            .decrypt({ text: selectedText })
                            .plaintext.toString()
                    );
                    await vscode.workspace.applyEdit(workspaceEdit);
                } catch (e) {
                    logger.error("Failed to decrypt key.", e);
                }
            }
        )
    );
}
