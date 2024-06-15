import dayjs from "dayjs";

import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/init";

export function subscribeTimestampHoverProvider() {
    const provider = vscode.languages.registerHoverProvider("*", {
        provideHover: (document, position, token) => {
            const word = document.getText(
                document.getWordRangeAtPosition(position)
            );

            const timestamp = dayjs
                .unix(Number(word))
                .format("YYYY-MM-DD HH:mm:ss");
            const content = new vscode.MarkdownString(
                timestamp !== "Invalid Date"
                    ? `Unix: ${word} -> ${timestamp}`
                    : ""
            );

            return new vscode.Hover(content);
        },
    });

    extensionCtx.subscriptions.push(provider);
}
