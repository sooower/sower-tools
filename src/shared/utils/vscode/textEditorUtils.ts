import ts from "typescript";

import { vscode } from "@/shared";

type TReplaceTextOfSourceFileOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    newText: string;
};

type TReplaceTextOfNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
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

type TDeleteTextOfNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
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

export class TextEditorUtils {
    static async replaceTextOfNode({
        editor,
        sourceFile,
        node,
        newText,
    }: TReplaceTextOfNodeOptions) {
        const startPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            node.getStart()
        );
        const endPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            node.getEnd()
        );
        await editor.edit((editBuilder) => {
            editBuilder.replace(
                new vscode.Range(
                    new vscode.Position(startPos.line, startPos.character),
                    new vscode.Position(endPos.line, endPos.character)
                ),
                newText
            );
        });
    }

    static async replaceTextRangeOffset({
        editor,
        start,
        end,
        newText,
        endPlusOne,
    }: TReplaceTextRangeOffsetOptions) {
        await editor.edit((editBuilder) => {
            editBuilder.replace(
                new vscode.Range(
                    editor.document.positionAt(start),
                    editor.document.positionAt(
                        endPlusOne === true ? end + 1 : end
                    )
                ),
                newText
            );
        });
    }

    static async replaceTextOfSourceFile({
        editor,
        sourceFile,
        newText,
    }: TReplaceTextOfSourceFileOptions) {
        const startPos = ts.getLineAndCharacterOfPosition(sourceFile, 0);
        const endPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            Number.MAX_VALUE
        );
        await editor.edit((editBuilder) => {
            editBuilder.replace(
                new vscode.Range(
                    new vscode.Position(startPos.line, startPos.character),
                    new vscode.Position(endPos.line, endPos.character)
                ),
                newText
            );
        });
    }

    static async deleteTextOfNode({
        editor,
        sourceFile,
        node,
    }: TDeleteTextOfNodeOptions) {
        const startPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            node.getStart()
        );
        const endPos = ts.getLineAndCharacterOfPosition(
            sourceFile,
            node.getEnd()
        );
        await editor.edit((editBuilder) => {
            editBuilder.delete(
                new vscode.Range(
                    new vscode.Position(startPos.line, startPos.character),
                    new vscode.Position(endPos.line, endPos.character)
                )
            );
        });
    }

    static async insertTextBeforeNode({
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
        await editor.edit((editBuilder) => {
            editBuilder.insert(
                new vscode.Position(startPos.line, startPos.character),
                text + lineBreak
            );
        });
    }

    static async insertTextAfterNode({
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
        await editor.edit((editBuilder) => {
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

    static async insertTextAtOffset({
        editor,
        offset,
        text,
        lineBreak = "\n\n",
    }: TInsertTextAtOffsetOptions) {
        await editor.edit((editBuilder) => {
            editBuilder.insert(
                editor.document.positionAt(offset),
                lineBreak + text
            );
        });
    }
}
