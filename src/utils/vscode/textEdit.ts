import ts from "typescript";

import { vscode } from "@/core";

type TReplaceTextOfNodeOptions = {
    editor: vscode.TextEditor;
    node: ts.Node;
    newText: string;
};

type TInsertTextAfterNodeOptions = {
    editor: vscode.TextEditor;
    node: ts.Node;
    text: string;
    lineBreak?: string;
};

type TReplaceTextRangeOffsetOptions = {
    editor: vscode.TextEditor;
    start: number;
    end: number;
    newText: string;
    endPlusOne?: boolean;
};

class TextEditUtils {
    replaceTextOfNode({ editor, node, newText }: TReplaceTextOfNodeOptions) {
        return vscode.TextEdit.replace(
            new vscode.Range(
                editor.document.positionAt(node.getStart()),
                editor.document.positionAt(node.getEnd())
            ),
            newText
        );
    }

    insertTextAfterNode({
        editor,
        node,
        text,
        lineBreak = "\n\n",
    }: TInsertTextAfterNodeOptions) {
        return vscode.TextEdit.insert(
            editor.document.positionAt(node.getEnd()),
            lineBreak + text
        );
    }

    replaceTextRangeOffset({
        editor,
        start,
        end,
        newText,
        endPlusOne,
    }: TReplaceTextRangeOffsetOptions) {
        return vscode.TextEdit.replace(
            new vscode.Range(
                editor.document.positionAt(start),
                editor.document.positionAt(endPlusOne === true ? end + 1 : end)
            ),
            newText
        );
    }
}

export const textEditUtils = new TextEditUtils();
