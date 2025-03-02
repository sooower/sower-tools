import crypto from "node:crypto";

import { extensionCtx, extensionName, logger, vscode } from "@/core";

import { keyCryptoToolsKey } from "../configs";
import { KeyCrypto } from "./utils";

export function registerCommandKeyEncrypt() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.keyCryptoTools.keyEncrypt`,
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
                        keydecrypt.encrypt(crypto.randomBytes(16), selectedText)
                    );
                    await vscode.workspace.applyEdit(workspaceEdit);
                } catch (e) {
                    logger.error("Failed to encrypt key.", e);
                }
            }
        )
    );
}
