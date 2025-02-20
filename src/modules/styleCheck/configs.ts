import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
        .array(z.string())
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.ignore.patterns`)
        );

    ignoreCompatibleConfigFilenames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.ignore.compatibleConfigFilenames`
            )
        );
}
