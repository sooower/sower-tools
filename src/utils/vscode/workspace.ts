import { vscode } from "@/core";
import { CommonUtils } from "@utils/common";

/**
 * Get the workspace folder.
 * @throws Error if no workspace folder is found.
 * @returns The workspace folder.
 */
export function getWorkspaceFolder(): vscode.WorkspaceFolder {
    const workspaceFolder = vscode.workspace.workspaceFolders?.at(0);
    CommonUtils.assert(
        workspaceFolder !== undefined,
        `No workspace folder found.`
    );

    return workspaceFolder;
}

/**
 * Get the workspace folder path.
 * @throws Error if no workspace folder is found.
 * @returns The workspace folder path.
 */
export function getWorkspaceFolderPath(): string {
    return getWorkspaceFolder().uri.path;
}

/**
 * Get the workspace folder safely.
 * @returns The workspace folder or undefined if no workspace folder is found.
 */
export function getWorkspaceFolderSafe(): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.workspaceFolders?.at(0);
}

/**
 * Get the workspace folder path safely.
 * @returns The workspace folder path.
 */
export function getWorkspaceFolderPathSafe(): string | undefined {
    return getWorkspaceFolderSafe()?.uri.path;
}
