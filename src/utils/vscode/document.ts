import { vscode } from "@/core";

export function getTrimmedLineText(
    document: vscode.TextDocument,
    lineIndex: number
) {
    return document.lineAt(lineIndex).text.trim();
}
