import { vscode } from "@/core";
import { CommonUtils } from "@utils/common";

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
