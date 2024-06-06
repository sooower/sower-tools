import ts from "typescript";

import { vscode } from "../";

type TReplaceNodeTextOptions = {
    activatedEditor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    newText: string;
};

export async function replaceNodeText({
    activatedEditor,
    sourceFile,
    node,
    newText,
}: TReplaceNodeTextOptions) {
    const declarationStartPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getStart()
    );
    const declarationEndPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        node.getEnd()
    );

    await activatedEditor.edit((editBuilder) => {
        editBuilder.replace(
            new vscode.Range(
                new vscode.Position(
                    declarationStartPos.line,
                    declarationStartPos.character
                ),
                new vscode.Position(
                    declarationEndPos.line,
                    declarationEndPos.character
                )
            ),
            newText
        );
    });
}

type TInsertTextBeforeNodeOptions = {
    activatedEditor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    text: string;
    fullStart?: boolean;
};

export async function insertTextBeforeNode({
    activatedEditor,
    sourceFile,
    node,
    text,
    fullStart,
}: TInsertTextBeforeNodeOptions) {
    const startPos = ts.getLineAndCharacterOfPosition(
        sourceFile,
        fullStart !== undefined ? node.getFullStart() : node.getStart()
    );

    await activatedEditor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(startPos.line, startPos.character),
            text + "\n\n"
        );
    });
}

type TInsertTextAfterNodeOptions = {
    activatedEditor: vscode.TextEditor;
    sourceFile: ts.SourceFile;
    node: ts.Node;
    text: string;
};

export async function insertTextAfterNode({
    activatedEditor,
    sourceFile,
    node,
    text,
}: TInsertTextAfterNodeOptions) {
    const endPos = ts.getLineAndCharacterOfPosition(sourceFile, node.getEnd());

    await activatedEditor.edit((editBuilder) => {
        editBuilder.insert(
            new vscode.Position(endPos.line, endPos.character),
            "\n\n" + text
        );
    });
}
