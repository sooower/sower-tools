import ts from "typescript";

import { vscode } from "@/shared";

export function getSourceFileByEditor(editor: vscode.TextEditor) {
    return ts.createSourceFile(
        editor.document.fileName,
        editor.document.getText(),
        ts.ScriptTarget.ES2015,
        true
    );
}
