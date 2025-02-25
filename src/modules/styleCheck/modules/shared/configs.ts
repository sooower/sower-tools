import path from "node:path";

import ignore from "ignore";
import z from "zod";

import { extensionName, fs, getConfigurationItem, logger } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { readFile } from "@utils/fs";

/**
 * The 'glob' patterns of files that will be ignored when checking style.
 * The priority is higher than compatibility config files.
 */
export let ignorePatterns: string[];

/**
 * The compatible config filenames (not including paths) that will be used to ignore style check
 * files. The priority is lower than patterns.
 */
export let ignoreCompatibleConfigFilenames: string[];

export function parseConfigs() {
    ignorePatterns = z
        .array(z.string().min(1))
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.ignore.patterns`)
        );

    ignoreCompatibleConfigFilenames = z
        .array(z.string().min(1))
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.ignore.compatibleConfigFilenames`
            )
        );
}

/**
 * The ignore manager instance.
 *
 * **NOTE:** This instance is only used in the style check module.
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

    logger.trace("Loaded ignore patterns.");
}
