import { vscode } from "@/core";
import { CommonUtils } from "@utils/common";

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

/**
 * Get the workspace relative path of the given document or URI.
 * @param docOrUriLike - The document or URI to get the workspace relative path.
 * @returns The workspace relative path of the given document or URI.
 */
export function getWorkspaceRelativePath(
    docOrUriLike: vscode.TextDocument | vscode.Uri | string
) {
    if (CommonUtils.isString(docOrUriLike)) {
        return vscode.workspace.asRelativePath(docOrUriLike);
    }

    if (docOrUriLike instanceof vscode.Uri) {
        return vscode.workspace.asRelativePath(docOrUriLike.fsPath);
    }

    return vscode.workspace.asRelativePath(docOrUriLike.fileName);
}
