import ts from "typescript";

import { vscode } from "@/shared";
import { CommonUtils } from "@utils/common";

export function getSourceFileByEditor(editor: vscode.TextEditor) {
    return ts.createSourceFile(
        editor.document.fileName,
        editor.document.getText(),
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
