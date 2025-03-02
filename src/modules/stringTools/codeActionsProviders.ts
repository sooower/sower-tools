import { extensionCtx, vscode } from "@/core";

import { enableReplaceText } from "./configs";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("*", {
            provideCodeActions(document, range, context, token) {
                const selectedText = document.getText(range).trim();
                if (selectedText === "") {
                    return [];
                }

                // Base64 encode

                const base64EncodeCodeAction = new vscode.CodeAction(
                    "Base64 encode",
                    vscode.CodeActionKind.RefactorRewrite
                );
                const encodedText = Buffer.from(selectedText, "utf-8").toString(
                    "base64"
                );
                base64EncodeCodeAction.edit = new vscode.WorkspaceEdit();
                enableReplaceText
                    ? base64EncodeCodeAction.edit.replace(
                          document.uri,
                          range,
                          encodedText
                      )
                    : base64EncodeCodeAction.edit.insert(
                          document.uri,
                          range.end,
                          "\n" + encodedText
                      );

                // Base64 decode

                const base64DecodeCodeAction = new vscode.CodeAction(
                    "Base64 decode",
                    vscode.CodeActionKind.RefactorRewrite
                );
                const decodedText = Buffer.from(
                    selectedText,
                    "base64"
                ).toString("utf-8");
                base64DecodeCodeAction.edit = new vscode.WorkspaceEdit();
                enableReplaceText
                    ? base64DecodeCodeAction.edit.replace(
                          document.uri,
                          range,
                          decodedText
                      )
                    : base64DecodeCodeAction.edit.insert(
                          document.uri,
                          range.end,
                          "\n" + decodedText
                      );

                return [base64EncodeCodeAction, base64DecodeCodeAction];
            },
        })
    );
}
