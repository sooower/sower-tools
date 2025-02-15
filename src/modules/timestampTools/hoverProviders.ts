import { vscode } from "@/shared";
import { extensionCtx } from "@/shared/context";
import { datetime } from "@utils/datetime";

export function registerHoverProvider() {
    extensionCtx.subscriptions.push(
        vscode.languages.registerHoverProvider("*", {
            provideHover(document, position, token) {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                let word: string;
                const selectedWord = document.getText(editor.selection);
                if (selectedWord !== "") {
                    word = selectedWord;
                } else {
                    const wordRange = document.getWordRangeAtPosition(position);
                    if (wordRange === undefined) {
                        return;
                    }

                    word = document.getText(wordRange);
                }

                if (!/^\d+$/.test(word)) {
                    return;
                }

                try {
                    const timestamp = datetime
                        .unix(Number(word))
                        .format("YYYY-MM-DD HH:mm:ss"); // TODO: update to load timestamp format from configuration

                    if (timestamp === "Invalid Date") {
                        return;
                    }

                    const content = new vscode.MarkdownString(
                        `Unix: ${word} -> ${timestamp}`
                    );

                    return new vscode.Hover(content);
                } catch (e) {
                    console.error("Error while processing timestamp hover:", e);

                    return;
                }
            },
        })
    );
}
