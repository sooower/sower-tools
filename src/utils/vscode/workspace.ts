import { vscode } from "@/core";

/**
 * Get the workspace folder safely.
 * @returns The workspace folder or undefined if no workspace folder is found.
 */
export function getWorkspaceFolder(): vscode.WorkspaceFolder | undefined {
    return vscode.workspace.workspaceFolders?.at(0);
}

/**
 * Get the workspace folder path safely.
 * @returns The workspace folder path.
 */
export function getWorkspaceFolderPath(): string | undefined {
    return getWorkspaceFolder()?.uri.path;
}
