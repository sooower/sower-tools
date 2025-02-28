import path from "node:path";

import chokidar from "chokidar";
import ignore from "ignore";

import { extensionCtx, format, fs, logger } from "@/core";
import { calcFileContentMd5 } from "@/utils/common";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { datetime } from "@utils/datetime";

import {
    enableProjectSnapshot,
    ignorePatterns,
    maxLegacyVersions,
    snapshotRootPath,
} from "./configs";

export async function watchWorkspaceFiles() {
    const workspacePath = getWorkspaceFolderPath();
    if (workspacePath === undefined) {
        return;
    }

    // Create a watcher to watch the workspace path

    const ignorePatterns = await buildIgnorePatterns(workspacePath);

    const watcher = chokidar.watch(workspacePath, {
        ignored: ignorePatterns,
        persistent: true,
        ignoreInitial: true,
    });

    watcher.on("all", async (event, filePath) => {
        try {
            await saveFileSnapshot(filePath, ignorePatterns);
        } catch (e) {
            logger.error(`Failed to save project snapshot.`, e);
        }
    });

    extensionCtx.subscriptions.push({
        dispose: () => watcher.close(),
    });
}

async function buildIgnorePatterns(workspacePath: string) {
    const gitIgnoreFilePath = path.join(workspacePath, ".gitignore");
    let gitIgnorePatterns: string[] = [];
    if (fs.existsSync(gitIgnoreFilePath)) {
        gitIgnorePatterns = (
            await fs.promises.readFile(gitIgnoreFilePath, "utf-8")
        ).split("\n");
    }
    const allIgnorePatterns = [
        ...new Set(
            [...ignorePatterns, ...gitIgnorePatterns].filter(
                it => it.trim() !== ""
            )
        ),
    ];

    return allIgnorePatterns;
}

async function saveFileSnapshot(filePath: string, ignorePatterns: string[]) {
    if (!enableProjectSnapshot) {
        return;
    }

    const workspacePath = getWorkspaceFolderPath();
    if (workspacePath === undefined) {
        return;
    }

    const relPath = path.relative(workspacePath, filePath);

    const ig = ignore().add(ignorePatterns);
    if (ig.ignores(relPath)) {
        logger.trace(`File "${relPath}" is ignored, skipped to save snapshot.`);

        return;
    }

    if (!fs.existsSync(filePath)) {
        logger.trace(`File "${relPath}" not exists, skipped to save snapshot.`);

        return;
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile() || stat.size === 0) {
        logger.trace(
            `File "${relPath}" is not a file or empty, skipped to save snapshot.`
        );

        return;
    }

    // Skip if the file content is not changed

    const snapshotDirPath = path.join(
        snapshotRootPath,
        workspacePath.replaceAll(path.sep, "."),
        path.dirname(relPath)
    );
    await fs.promises.mkdir(snapshotDirPath, { recursive: true });
    const files = await fs.promises.readdir(snapshotDirPath);
    const lastSnapshotFilename = files.sort().at(-1);
    if (lastSnapshotFilename !== undefined) {
        const lastSnapshotFileContentMd5 = await calcFileContentMd5(
            path.join(snapshotDirPath, lastSnapshotFilename)
        );
        const currFileContentMd5 = await calcFileContentMd5(filePath);
        if (lastSnapshotFileContentMd5 === currFileContentMd5) {
            logger.trace(
                `File "${relPath}" content is not changed, skipped to save snapshot.`
            );

            return;
        }
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
