import { extensionCtx, vscode } from "@/core";
import { datetime } from "@utils/datetime";

import { timestampFormat } from "./configs";

export function registerCodeActionsProviders() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerCodeActionsProvider("*", {
            provideCodeActions(document, range, context, token) {
                if (range.isEmpty) {
                    // Insert timestamp

                    const codeAction = new vscode.CodeAction(
                        "Insert timestamp",
                        vscode.CodeActionKind.Empty
                    );
                    codeAction.edit = new vscode.WorkspaceEdit();
                    codeAction.edit.insert(
                        document.uri,
                        range.start,
                        datetime().format(timestampFormat)
                    );

                    return [codeAction];
                }

                // Convert to timestamp or unix

                let timestamp: string;
                const selectedText = document.getText(range).trim();
                if (/^\d+$/.test(selectedText)) {
                    timestamp = datetime
                        .unix(Number(selectedText))
                        .format(timestampFormat);

                    if (timestamp === "Invalid Date") {
                        throw new Error(
                            `Invalid timestamp: "${selectedText}".`
                        );
                    }
                } else {
                    timestamp = String(datetime(selectedText).unix());

                    if (timestamp === "NaN") {
                        throw new Error(
                            `Invalid timestamp: "${selectedText}".`
                        );
                    }
                }

                const codeAction = new vscode.CodeAction(
                    `Convert timestamp to: ${timestamp}`,
                    vscode.CodeActionKind.RefactorRewrite
                );

                codeAction.edit = new vscode.WorkspaceEdit();
                codeAction.edit.replace(document.uri, range, timestamp);

                return [codeAction];
            },
        })
    );
}
