import { extensionCtx, vscode } from "@/core";
import { datetime } from "@utils/datetime";

import { timestampFormat } from "./configs";

export function registerHoverProvider() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerHoverProvider("*", {
            provideHover(document, position, token) {
                // Show timestamp when hovering over a number

                const selectedWord = document.getText(
                    document.getWordRangeAtPosition(position)
                );
                if (selectedWord === "") {
                    return;
                }

                if (!/^\d+$/.test(selectedWord)) {
                    return;
                }

                const timestamp = datetime
                    .unix(Number(selectedWord))
                    .format(timestampFormat);

                if (timestamp === "Invalid Date") {
                    return;
                }

                return new vscode.Hover(
                    new vscode.MarkdownString(
                        `Unix: ${selectedWord} -> ${timestamp}`
                    )
                );
            },
        })
    );
}
