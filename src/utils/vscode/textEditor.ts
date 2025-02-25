import { Node } from "ts-morph";
import ts from "typescript";

import { vscode } from "@/core";

import { buildRangeByNode, buildRangeByOffsets } from "./range";

type TReplaceTextOfSourceFileOptions = {
    editor: vscode.TextEditor;
    newText: string;
};

type TReplaceTextOfNodeOptions = {
    editor: vscode.TextEditor;
    node: ts.Node | Node;
    newText: string;
};

type TReplaceTextRangeOffsetOptions = {
    editor: vscode.TextEditor;
    start: number;
    end: number;
    newText: string;
    endPlusOne?: boolean;
};

type TInsertTextBeforeNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    text: string;
    fullStart?: boolean;
    lineBreak?: string;
};

type TInsertTextAfterNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    nodeEndPosPlusOne?: boolean;
    text: string;
    lineBreak?: string;
};

type TInsertTextAtOffsetOptions = {
    editor: vscode.TextEditor;
    offset: number;
    text: string;
    lineBreak?: string;
};

class TextEditorUtils {
    async replaceTextOfNode({
        editor,
        node,
        newText,
    }: TReplaceTextOfNodeOptions) {
        await editor.edit(editBuilder => {
            editBuilder.replace(
                buildRangeByNode(editor.document, node),
                newText
            );
        });
    }

    async replaceTextRangeOffset({
        editor,
        start,
        end,
        newText,
        endPlusOne,
    }: TReplaceTextRangeOffsetOptions) {
        await editor.edit(editBuilder => {
            editBuilder.replace(
                buildRangeByOffsets(
                    editor.document,
                    start,
                    endPlusOne === true ? end + 1 : end
                ),
                newText
            );
        });
    }

    async replaceTextOfSourceFile({
        editor,
        newText,
    }: TReplaceTextOfSourceFileOptions) {
        await editor.edit(editBuilder => {
            editBuilder.replace(
                buildRangeByOffsets(
                    editor.document,
                    0,
                    editor.document.getText().length
                ),
                newText
            );
        });
    }

    async insertTextBeforeNode({
        editor,
        sourceFile,
        node,
        text,
        fullStart,
        lineBreak = "\n\n",
    }: TInsertTextBeforeNodeOptions) {
        const startPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            fullStart !== undefined ? node.getFullStart() : node.getStart()
        );
        await editor.edit(editBuilder => {
            editBuilder.insert(
                new vscode.Position(startPos.line, startPos.character),
                text + lineBreak
            );
        });
    }

    async insertTextAfterNode({
        editor,
        sourceFile,
        node,
        nodeEndPosPlusOne,
        text,
        lineBreak = "\n\n",
    }: TInsertTextAfterNodeOptions) {
        const endPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            node.getEnd()
        );
        await editor.edit(editBuilder => {
            editBuilder.insert(
                new vscode.Position(
                    endPos.line,
                    nodeEndPosPlusOne === true
                        ? endPos.character + 1
                        : endPos.character
                ),
                lineBreak + text
            );
        });
    }

    async insertTextAtOffset({
        editor,
        offset,
        text,
        lineBreak = "\n\n",
    }: TInsertTextAtOffsetOptions) {
        await editor.edit(editBuilder => {
            editBuilder.insert(
                editor.document.positionAt(offset),
                lineBreak + text
            );
        });
    }
}

export const textEditorUtils = new TextEditorUtils();
