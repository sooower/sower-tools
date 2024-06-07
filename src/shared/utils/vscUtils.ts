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
