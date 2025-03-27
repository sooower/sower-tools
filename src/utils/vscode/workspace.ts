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
 *
 * **NOTICE**: If the file is not in the workspace, it will be returned as is.
 *
 * @param document - The document to get the workspace relative path.
 * @returns The workspace relative path of the given document or URI.
 */
export function getPossibleWorkspaceRelativePath(
    document: vscode.TextDocument
): string;

/**
 * Get the workspace relative path of the given URI.
 *
 * **NOTICE**: If the file is not in the workspace, it will be returned as is.
 *
 * @param uri - The URI to get the workspace relative path.
 * @returns The workspace relative path of the given URI.
 */
export function getPossibleWorkspaceRelativePath(uri: vscode.Uri): string;

/**
 * Get the workspace relative path of the given file path.
 *
 * **NOTICE**: If the file is not in the workspace, it will be returned as is.
 *
 * @param filePath - The file path to get the workspace relative path.
 * @returns The workspace relative path of the given file path.
 */
export function getPossibleWorkspaceRelativePath(filePath: string): string;
export function getPossibleWorkspaceRelativePath(
    arg: vscode.TextDocument | vscode.Uri | string
): string {
    if (CommonUtils.isString(arg)) {
        return vscode.workspace.asRelativePath(arg);
    }

    if (arg instanceof vscode.Uri) {
        return vscode.workspace.asRelativePath(arg.fsPath);
    }

    return vscode.workspace.asRelativePath(arg.fileName);
}
