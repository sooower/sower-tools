import ts from "typescript";

import { vscode } from "../";

type TReplaceTextOfNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    newText: string;
};

export async function replaceTextOfNode({
    editor,
    sourceFile,
    node,
    newText,
}: TReplaceTextOfNodeOptions) {
    const startPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getStart()
    );
    const endPos = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());

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

type TReplaceTextRangeOffsetOptions = {
    editor: vscode.TextEditor;
    start: number;
    end: number;
    newText: string;
    endPlusOne?: boolean;
};

export async function replaceTextRangeOffset({
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
                editor.document.positionAt(endPlusOne === true ? end + 1 : end)
            ),
            newText
        );
    });
}

type TDeleteTextOfNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
};

export async function deleteTextOfNode({
    editor,
    sourceFile,
    node,
}: TDeleteTextOfNodeOptions) {
    const startPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getStart()
    );
    const endPos = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());

    await editor.edit((editBuilder) => {
        editBuilder.delete(
            new vscode.Range(
                new vscode.Position(startPos.line, startPos.character),
                new vscode.Position(endPos.line, endPos.character)
            )
        );
    });
}

type TInsertTextBeforeNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    text: string;
    fullStart?: boolean;
};

export async function insertTextBeforeNode({
    editor,
    sourceFile,
    node,
    text,
    fullStart,
}: TInsertTextBeforeNodeOptions) {
    const startPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        fullStart !== undefined ? node.getFullStart() : node.getStart()
    );

    await editor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(startPos.line, startPos.character),
            text + "\n\n"
        );
    });
}

type TInsertTextAfterNodeOptions = {
    editor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    text: string;
};

export async function insertTextAfterNode({
    editor,
    sourceFile,
    node,
    text,
}: TInsertTextAfterNodeOptions) {
    const endPos = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());

    await editor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(endPos.line, endPos.character),
            "\n\n" + text
        );
    });
}

type TInsertTextAtOffsetOptions = {
    editor: vscode.TextEditor;
    offset: number;
    text: string;
};

export async function insertTextAtOffset({
    editor,
    offset,
    text,
}: TInsertTextAtOffsetOptions) {
    await editor.edit((editBuilder) => {
        editBuilder.insert(editor.document.positionAt(offset), text);
    });
}

export function getSourceFile(editor: vscode.TextEditor) {
    return ts.createSourceFile(
        editor.document.fileName,
        editor.document.getText(),
        ts.ScriptTarget.ES2015,
        true
    );
}
