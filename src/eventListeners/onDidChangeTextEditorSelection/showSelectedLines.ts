import { format } from "node:util";

import { vscode } from "@/src/shared";

let statusBarItem: vscode.StatusBarItem;

type TShowSelectedLinesOptions = {
    editor: vscode.TextEditor;
    selection: vscode.Selection;
};

export function showSelectedLines({
    editor,
    selection,
}: TShowSelectedLinesOptions) {
    let lines = 0;
    let code = 0;
    const indexOfSelectedLineStart = selection.start.line;
    const indexOfSelectedLineEnd = selection.end.line;
    const selectedText = editor.document
        .getText(editor.selection)
        .split(/\r?\n/);

    for (let i = indexOfSelectedLineStart; i <= indexOfSelectedLineEnd; i++) {
        const currLineText = editor.document.lineAt(i).text;
        const currSelectedLineText = selectedText[i - indexOfSelectedLineStart];

        // Special handling for selected start or end line
        if (
            currSelectedLineText.trim() === "" &&
            (i === indexOfSelectedLineStart || i === indexOfSelectedLineEnd)
        ) {
            if (currSelectedLineText.length > 0) {
                lines++;
            }
            continue;
        }

        // Blank line
        if (currLineText.trim() === "") {
            lines++;
            continue;
        }

        // Comment line
        const languageId = editor.document.languageId;
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

        // Code line
        lines++;
        code++;
    }

    setSelectedLinesStatusItemText({
        lines,
        code,
    });
}

export function createAndShowStatusItem() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        100
    );
    setSelectedLinesStatusItemText({});
    statusBarItem.show();
}

export function setSelectedLinesStatusItemText({
    lines,
    code,
}: {
    lines?: number;
    code?: number;
}) {
    statusBarItem.text = format(
        `Selected Lines:%s, Code:%s`,
        lines ?? 0,
        code ?? 0
    );
}
