import ts from "typescript";

import { vscode } from "@/core";

import { buildRangeByNode, buildRangeByOffsets } from "./range";

type TReplaceTextOfNodeOptions = {
    editor: vscode.TextEditor;
    node: ts.Node;
    newText: string;
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
            buildRangeByNode(editor.document, node),
            newText
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
            buildRangeByOffsets(
                editor.document,
                start,
                endPlusOne === true ? end + 1 : end
            ),
            newText
        );
    }
}

export const textEditUtils = new TextEditUtils();
