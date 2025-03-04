import path from "node:path";

import ignore from "ignore";
import z from "zod";

import { extensionName, fs, getConfigurationItem, logger } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { readFile } from "@utils/fs";

export let ignorePatterns: string[];
export let ignoreFilePaths: string[];
export let ignoreCompatibleConfigFilenames: string[];
export let diagnoseUpdateDelay: number;

export function parseConfigs() {
    ignorePatterns = z
        .array(z.string().min(1))
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.ignore.patterns`)
        );
    ignoreFilePaths = z
        .array(z.string())
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.ignore.filePaths`)
        );
    ignoreCompatibleConfigFilenames = z
        .array(z.string().min(1))
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.ignore.compatibleConfigFilenames`
            )
        );
    diagnoseUpdateDelay = z
        .number()
        .min(0)
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.diagnoseUpdateDelay`
            )
        );
}

/**
 * The ignore manager instance.
 *
 * **NOTE:** This instance is only used in the 'style check' module.
 */
export let ignoreManager: ignore.Ignore;

export function loadIgnorePatterns() {
    ignoreManager = ignore();

    // Read configured glob patterns
    ignoreManager.add(ignorePatterns.filter(it => it.trim() !== ""));

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
                .filter(it => it.trim() !== "")
        );
    }

    logger.trace("[style-check] loaded ignore patterns.");
}
