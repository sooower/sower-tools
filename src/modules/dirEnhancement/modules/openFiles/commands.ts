import path from "node:path";

import { extensionCtx, extensionName, format, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";

import { ignoredFilenames } from "./configs";

export async function registerCommandOpenFiles() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.dirEnhancement.openFiles`,
            async (uri: vscode.Uri) => {
                try {
                    await openFiles(uri);
                } catch (e) {
                    logger.error("Failed to open files.", e);
                }
            }
        )
    );
}

async function openFiles(uri: vscode.Uri) {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const files = (await getFilesInFolder(uri)).filter(
        it => !ignoredFilenames.includes(path.basename(it.path))
    );

    const relativePath = path.relative(workspaceFolderPath, uri.path);

    let openedFilesCount = 0;
    await vscode.window.withProgress(
        {
            location: vscode.ProgressLocation.Notification,
            cancellable: true,
        },
        async (progress, token) => {
            for (const file of files) {
                try {
                    if (token.isCancellationRequested) {
                        break;
                    }

                    await vscode.window.showTextDocument(file);
                    progress.report({
                        increment: (1 / files.length) * 100,
                        message: format(
                            `Opening file [%d/%d] in dir "${relativePath}".`,
                            ++openedFilesCount,
                            files.length
                        ),
                    });
                } catch (e) {
                    logger.warn(`Skipped to open file "${file}".`, e);
                }
            }

            if (openedFilesCount === files.length) {
                logger.info(
                    `Total of ${files.length} files in dir "${relativePath}" were opened.`
                );
            }
        }
    );
}

async function getFilesInFolder(uri: vscode.Uri) {
    const files: vscode.Uri[] = [];
    const entries = await vscode.workspace.fs.readDirectory(uri);

    for (const [name, type] of entries) {
        const fullPath = vscode.Uri.joinPath(uri, name);
        switch (type) {
            case vscode.FileType.Directory: {
                files.push(...(await getFilesInFolder(fullPath)));

                break;
            }
            case vscode.FileType.File: {
                files.push(fullPath);

                break;
            }
            default: {
                logger.warn(
                    `Skipped handle file type "${type}" for file "${fullPath}".`
                );
            }
        }
    }

    return files;
}
