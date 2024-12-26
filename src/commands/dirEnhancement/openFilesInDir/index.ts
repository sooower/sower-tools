import path from "node:path";
import { format } from "node:util";

import { vscode } from "@/shared";
import {
    extensionCtx,
    extensionName,
    skippedShowFilenames,
} from "@/shared/init";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";

export async function subscribeOpenFilesInDir() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.dirEnhancement.openFilesInDir`,
        async (uri: vscode.Uri) => {
            try {
                const files = (await getFilesInFolder(uri)).filter(
                    it => !skippedShowFilenames.includes(path.basename(it.path))
                );

                const relativePath = path.relative(
                    getWorkspaceFolderPath(),
                    uri.path
                );

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
                                        `[%d/%d] files in dir '${relativePath}' were opened.`,
                                        ++openedFilesCount,
                                        files.length
                                    ),
                                });
                            } catch (e) {
                                vscode.window.showWarningMessage(
                                    `Skipped to open file '${file}'. ${e}`
                                );
                            }
                        }

                        vscode.window.showInformationMessage(
                            `A total of ${openedFilesCount} files in dir '${relativePath}' were opened.`
                        );
                    }
                );
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(command);
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
                console.warn(
                    `Skipped handle file type '${type}' for file '${fullPath}'.`
                );
            }
        }
    }

    return files;
}
