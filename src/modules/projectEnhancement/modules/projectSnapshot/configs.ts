import path from "node:path";

import ignore from "ignore";
import z from "zod";

import { extensionName, fs, getConfigurationItem, logger } from "@/core";
import { parseHomeDirAlias } from "@/utils/common";
import { getWorkspaceFolderPath } from "@/utils/vscode/workspace";
import { readFile } from "@utils/fs";

export let enableProjectSnapshot: boolean;
export let maxLegacyVersions: number;
export let snapshotRootPath: string;
export let ignorePatterns: string[];
export let ignoreCompatibleConfigFilenames: string[];

export function parseConfigs() {
    enableProjectSnapshot = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.projectEnhancement.projectSnapshot.enable`
            )
        );

    maxLegacyVersions = z
        .number()
        .default(30)
        .parse(
            getConfigurationItem(
                `${extensionName}.projectEnhancement.projectSnapshot.maxLegacyVersions`
            )
        );

    snapshotRootPath = parseHomeDirAlias(
        z
            .string()
            .parse(
                getConfigurationItem(
                    `${extensionName}.projectEnhancement.projectSnapshot.snapshotRootPath`
                )
            )
    );

    ignorePatterns = z
        .array(z.string())
        .default([])
        .parse(
            getConfigurationItem(
                `${extensionName}.projectEnhancement.projectSnapshot.ignorePatterns`
            )
        );

    ignoreCompatibleConfigFilenames = z
        .array(z.string())
        .default([])
        .parse(
            getConfigurationItem(
                `${extensionName}.projectEnhancement.projectSnapshot.ignoreCompatibleConfigFilenames`
            )
        );
}

/**
 * The ignore manager instance.
 *
 * **NOTE:** This instance is only used in the 'project snapshot' module.
 */
export let ignoreManager: ignore.Ignore;

export function loadIgnorePatterns() {
    ignoreManager = ignore();

    // Read configured glob patterns
    ignoreManager.add(ignorePatterns);

    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    // Read patterns from compatible config files
    for (const filename of ignoreCompatibleConfigFilenames) {
        const filePath = path.join(workspaceFolderPath, filename);
        if (!fs.existsSync(filePath)) {
            continue;
        }

        ignoreManager.add(
            readFile(filePath)
                .split("\n")
                .filter(it => it !== "")
        );
    }

    logger.trace("[project-snapshot] loaded ignore patterns.");
}
