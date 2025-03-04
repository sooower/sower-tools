import path from "node:path";

import {
    extensionCtx,
    extensionName,
    format,
    fs,
    logger,
    vscode,
} from "@/core";
import {
    getWorkspaceFolderPath,
    getWorkspaceRelativePath,
} from "@/utils/vscode";

import { ignoredFilenames } from "./configs";

export async function registerCommandExpandFolder() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.folderEnhancement.expandFolder`,
            async (uri: vscode.Uri) => {
                try {
                    await expandFolder(uri);
                } catch (e) {
                    logger.error("Failed to expand folder.", e);
                }
            }
        )
    );
}

async function expandFolder(uri: vscode.Uri) {
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            cancellable: true,
        },
        async (progress, token) => {
            const workspaceFolderPath = getWorkspaceFolderPath();
            if (workspaceFolderPath === undefined) {
                return;
            }

            const fileUris = (await getFilesInDir(uri)).filter(
                it => !ignoredFilenames.includes(path.basename(it.fsPath))
            );
            const relPath = getWorkspaceRelativePath(uri);

            let openedFilesCount = 0;
            for (const fileUri of fileUris) {
                try {
                    if (token.isCancellationRequested) {
                        break;
                    }

                    // Open document in memory for diagnostic and reveal in explorer
                    await vscode.workspace.openTextDocument(fileUri);
                    await vscode.commands.executeCommand(
                        "revealInExplorer",
                        fileUri
                    );

                    progress.report({
                        increment: (1 / fileUris.length) * 100,
                        message: format(
                            `Opening file [%d/%d] in folder "${relPath}".`,
                            ++openedFilesCount,
                            fileUris.length
                        ),
                    });
                } catch (e) {
                    logger.warn(`Skipped to open file "${fileUri}".`, e);
                }
            }

            if (openedFilesCount === fileUris.length) {
                logger.info(
                    `Opened [${openedFilesCount}/${fileUris.length}] files in folder "${relPath}".`
                );
            }
        }
    );
}

async function getFilesInDir(uri: vscode.Uri) {
    if (!fs.statSync(uri.fsPath).isDirectory()) {
        return [];
    }

    const files: vscode.Uri[] = [];
    const entries = await vscode.workspace.fs.readDirectory(uri);

    for (const [name, type] of entries) {
        const fullPath = vscode.Uri.joinPath(uri, name);
        switch (type) {
            case vscode.FileType.Directory: {
                files.push(...(await getFilesInDir(fullPath)));

                break;
            }
            case vscode.FileType.File: {
                files.push(fullPath);

                break;
            }
            default: {
                logger.warn(
                    `Skipped handle file type "${type}" for file "${fullPath.fsPath}".`
                );
            }
        }
    }

    return files;
}
