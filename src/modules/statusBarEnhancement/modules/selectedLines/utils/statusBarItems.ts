import { format, vscode } from "@/core";

let statusBarItem: vscode.StatusBarItem;

export function createAndShowStatusBarItem() {
    statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Right,
        -90
    );
    setSelectedLinesStatusItemText({ totalLines: 0, nonEmptyLines: 0 });
    statusBarItem.show();
}

export function setSelectedLinesStatusItemText({
    totalLines,
    nonEmptyLines,
}: {
    totalLines: number;
    nonEmptyLines: number;
}) {
    statusBarItem.text = format(`Sel. (%d/%d)`, nonEmptyLines, totalLines);
    statusBarItem.tooltip = format(
        "Selected %d lines, non-empty %d lines.",
        totalLines,
        nonEmptyLines
    );
}
