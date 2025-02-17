import { vscode } from "@/core";

import { setSelectedLinesStatusItemText } from "./statusBarItems";

type TRefreshSelectedLinesOptions = {
    editor: vscode.TextEditor;
    selection: vscode.Selection;
};

export function refreshSelectedLines({
    editor,
    selection,
}: TRefreshSelectedLinesOptions) {
    let totalLines = 0;
    let nonEmptyLines = 0;
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
                totalLines++;
            }
            continue;
        }

        // Blank line
        if (currLineText.trim() === "") {
            totalLines++;
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
                totalLines++;
                continue;
            }
        }

        // Code line
        totalLines++;
        nonEmptyLines++;
    }

    setSelectedLinesStatusItemText({
        totalLines,
        nonEmptyLines,
    });
}
