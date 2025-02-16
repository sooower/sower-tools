import ts from "typescript";

import { vscode } from "@/shared";
import { CommonUtils } from "@utils/common";

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
export function getWorkspaceFolder() {
    CommonUtils.assert(
        vscode.workspace.workspaceFolders !== undefined,
        `No workspace folder found.`
    );

    const [workspaceFolder] = vscode.workspace.workspaceFolders;

    return workspaceFolder;
}

export function getWorkspaceFolderPath() {
    return getWorkspaceFolder().uri.path;
}
