import path from "node:path";

import { extensionCtx, format, fs, logger, vscode } from "@/core";
import { calcFileContentMd5 } from "@/utils/common";
import {
    getWorkspaceFolderPath,
    getWorkspaceRelativePath,
} from "@/utils/vscode";
import { datetime } from "@utils/datetime";

import {
    enableProjectSnapshot,
    ignoreManager,
    maxLegacyVersions,
    snapshotRootPath,
} from "./configs";

export function registerListeners() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async document => {
            await saveFileSnapshot(document.fileName);
        }),
        vscode.workspace.onDidCreateFiles(async e => {
            await Promise.all(
                e.files.map(async uri => {
                    await saveFileSnapshot(uri.fsPath);
                })
            );
        })
    );
}

async function saveFileSnapshot(filePath: string) {
    if (!enableProjectSnapshot) {
        return;
    }

    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const relPath = getWorkspaceRelativePath(filePath);

    if (ignoreManager.ignores(relPath)) {
        logger.trace(`File "${relPath}" is ignored, skipped to save snapshot.`);

        return;
    }

    if (!fs.existsSync(filePath)) {
        logger.trace(`File "${relPath}" not exists, skipped to save snapshot.`);

        return;
    }

    if (!fs.statSync(filePath).isFile()) {
        logger.trace(
            `File "${relPath}" is not a file, skipped to save snapshot.`
        );

        return;
    }

    const snapshotDirPath = path.join(
        snapshotRootPath,
        workspaceFolderPath.replaceAll(path.sep, "."),
        path.dirname(relPath)
    );

    // Skip if the file content is not changed
    if (
        !(await isSnapshotContentChanged(
            workspaceFolderPath,
            filePath,
            snapshotDirPath
        ))
    ) {
        return;
    }

    // Save the file to the snapshot path

    const snapshotPath = path.join(
        snapshotDirPath,
        format(
            `%s_%s%s`,
            path.basename(relPath, path.extname(relPath)),
            datetime().format("YYYYMMDD_HHmmss"),
            path.extname(relPath)
        )
    );
    if (!fs.existsSync(snapshotDirPath)) {
        await fs.promises.mkdir(snapshotDirPath, { recursive: true });
    }
    await fs.promises.copyFile(filePath, snapshotPath);
    logger.trace(`Saved snapshot for file "${relPath}" to "${snapshotPath}".`);

    // Delete the legacy versions if needed

    if (maxLegacyVersions > 0) {
        const files = await fs.promises.readdir(snapshotDirPath);
        if (files.length > maxLegacyVersions) {
            const legacyFileCount = files.length - maxLegacyVersions;
            await Promise.all(
                files
                    .sort()
                    .slice(0, legacyFileCount)
                    .map(async it => {
                        await fs.promises.unlink(
                            path.join(snapshotDirPath, it)
                        );
                    })
            );
            logger.trace(
                `Deleted ${legacyFileCount} legacy version(s) of file "${relPath}" from "${snapshotDirPath}".`
            );
        }
    }
}

async function isSnapshotContentChanged(
    workspaceFolderPath: string,
    filePath: string,
    snapshotDirPath: string
): Promise<boolean> {
    if (!fs.existsSync(snapshotDirPath)) {
        return true;
    }

    const relPath = path.relative(workspaceFolderPath, filePath);

    const files = await fs.promises.readdir(snapshotDirPath);
    const currFilename = path.basename(relPath);
    const currFileExt = path.extname(relPath);
    const currFilenameWithoutExt = currFilename.replace(currFileExt, "");
    const lastSnapshotFilename = files
        .filter(
            it =>
                it.startsWith(currFilenameWithoutExt) &&
                it.endsWith(currFileExt)
        )
        .sort()
        .at(-1);
    if (lastSnapshotFilename === undefined) {
        return true;
    }

    const lastFilenameClean = lastSnapshotFilename.replace(
        new RegExp(`(_[0-9]{8}_[0-9]{6})${currFileExt}$`),
        currFileExt
    );

    if (lastFilenameClean !== currFilename) {
        return true;
    }

    const lastSnapshotFileContentMd5 = await calcFileContentMd5(
        path.join(snapshotDirPath, lastSnapshotFilename)
    );
    const currFileContentMd5 = await calcFileContentMd5(filePath);

    return lastSnapshotFileContentMd5 !== currFileContentMd5;
}
