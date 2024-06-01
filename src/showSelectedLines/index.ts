import { format } from "node:util";

import { vscode } from "../shared";
import { extensionCtx } from "../shared/init";

let statusBarItem: vscode.StatusBarItem;

export async function subscribeShowSelectedLines() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    showSelectedLines({});
    statusBarItem.show();

    vscode.window.onDidChangeTextEditorSelection((event) => {
        const activatedEditor = vscode.window.activeTextEditor;
        if (activatedEditor === undefined) {
            return;
        }

        const [selection] = event.selections;
        if (selection.isEmpty) {
            return showSelectedLines({});
        }

        const selectedText = activatedEditor.document
            .getText(activatedEditor.selection)
            .split(/\r?\n/);

        const languageId = activatedEditor.document.languageId;

        /* Handling per selected line */

        let lines = 0;
        let code = 0;
        const indexOfSelectedLineStart = selection.start.line;
        const indexOfSelectedLineEnd = selection.end.line;
        for (
            let i = indexOfSelectedLineStart;
            i <= indexOfSelectedLineEnd;
            i++
        ) {
            const currLineText = activatedEditor.document.lineAt(i).text;
            const currSelectedLineText =
                selectedText[i - indexOfSelectedLineStart];

            /* Special handling for selected start or end line */

            if (
                currSelectedLineText.trim() === "" &&
                (i === indexOfSelectedLineStart || i === indexOfSelectedLineEnd)
            ) {
                if (currSelectedLineText.length > 0) {
                    lines++;
                }
                continue;
            }

            /* Blank line */

            if (currLineText.trim() === "") {
                lines++;
                continue;
            }

            /* Comment line */

            if (languageId === "javascript" || languageId === "typescript") {
                if (
                    currLineText.trimStart().startsWith("//") ||
                    currLineText.trimStart().startsWith("/*") ||
                    currLineText.trimEnd().endsWith("*/") ||
                    currLineText.trimStart().startsWith("*")
                ) {
                    lines++;
                    continue;
                }
            }

            /* Code line */

            lines++;
            code++;
        }

        showSelectedLines({
            lines,
            code,
        });
    });

    extensionCtx.subscriptions.push(statusBarItem);
}

function showSelectedLines({ lines, code }: { lines?: number; code?: number }) {
    statusBarItem.text = format(
        `Selected Lines:%s, Code:%s`,
        lines ?? 0,
        code ?? 0
    );
}
