import path from "node:path";

import { format, vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
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
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}

async function openFiles(uri: vscode.Uri) {
    const files = (await getFilesInFolder(uri)).filter(
        it => !ignoredFilenames.includes(path.basename(it.path))
    );

    const relativePath = path.relative(getWorkspaceFolderPath(), uri.path);

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
                            `Opening file [%d/%d] in dir '${relativePath}'.`,
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

            if (openedFilesCount === files.length) {
                vscode.window.showInformationMessage(
                    `Total of ${files.length} files in dir '${relativePath}' were opened.`
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
                console.warn(
                    `Skipped handle file type '${type}' for file '${fullPath}'.`
                );
            }
        }
    }

    return files;
}
