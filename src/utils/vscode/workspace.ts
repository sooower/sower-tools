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
 * @param docuement - The document to get the workspace relative path.
 * @returns The workspace relative path of the given document or URI.
 */
export function getWorkspaceRelativePath(
    docuement: vscode.TextDocument
): string;
/**
 * Get the workspace relative path of the given URI.
 * @param uri - The URI to get the workspace relative path.
 * @returns The workspace relative path of the given URI.
 */
export function getWorkspaceRelativePath(uri: vscode.Uri): string;
/**
 * Get the workspace relative path of the given file path.
 * @param filePath - The file path to get the workspace relative path.
 * @returns The workspace relative path of the given file path.
 */
export function getWorkspaceRelativePath(filePath: string): string;
export function getWorkspaceRelativePath(
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
