import { format } from "node:util";

import { StatusBarAlignment, StatusBarItem, window } from "vscode";

import { extensionCtx } from "../shared";

let statusBarItem: StatusBarItem;

export async function subscribeShowSelectedLines() {
    const activatedEditor = window.activeTextEditor;
    if (activatedEditor === undefined) {
        return;
    }
    const languageId = activatedEditor.document.languageId;

    // Only support js and ts by now
    if (languageId !== "javascript" && languageId !== "typescript") {
        return;
    }

    statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
    showSelectedLines({});
    statusBarItem.show();

    window.onDidChangeTextEditorSelection((event) => {
        const [selection] = event.selections;
        if (selection.isEmpty) {
            return showSelectedLines({});
        }

        const selectedText = activatedEditor.document
            .getText(activatedEditor.selection)
            .split(/\r?\n/);

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
            if (
                currSelectedLineText.trim() === "" &&
                (i === indexOfSelectedLineStart || i === indexOfSelectedLineEnd)
            ) {
                if (currSelectedLineText.length > 0) {
                    lines++;
                }
                continue;
            }

            // Comment or blank line
            if (
                currLineText.trim() === "" ||
                currLineText.trimStart().startsWith("//") ||
                currLineText.trimStart().startsWith("/*") ||
                currLineText.trimEnd().endsWith("*/") ||
                currLineText.trimStart().startsWith("*")
            ) {
                lines++;
                continue;
            }

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
