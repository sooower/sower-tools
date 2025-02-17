import ts from "typescript";

import { vscode } from "@/core";

export function createSourceFileByEditor(editor: vscode.TextEditor) {
    return createSourceFileByDocument(editor.document);
}

export function createSourceFileByDocument(document: vscode.TextDocument) {
    return ts.createSourceFile(
        document.fileName,
        document.getText(),
        ts.ScriptTarget.ES2015,
        true
    );
}
