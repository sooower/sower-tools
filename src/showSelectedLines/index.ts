import { StatusBarAlignment, StatusBarItem, window } from "vscode";

import { extensionCtx } from "../shared";

let statusBarItem: StatusBarItem;

export async function subscribeShowSelectedLines() {
    statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100);
    showSelectedLines(0);
    statusBarItem.show();

    window.onDidChangeTextEditorSelection((event) => {
        if (event.selections.length > 0) {
            const [selection] = event.selections;
            showSelectedLines(
                selection.isEmpty
                    ? 0
                    : selection.end.line - selection.start.line + 1
            );
        } else {
            showSelectedLines(0);
        }
    });

    extensionCtx.subscriptions.push(statusBarItem);
}

function showSelectedLines(line: number) {
    statusBarItem.text = `Selected Lines: ${line}`;
}
