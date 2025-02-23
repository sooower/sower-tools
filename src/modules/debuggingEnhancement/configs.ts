import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let debugCurrentFileConfigurationNames: string[];
export let debugProjectConfigurationNames: string[];

export function parseConfigs() {
    debugCurrentFileConfigurationNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.debuggingEnhancement.debugCurrentFileConfigurationNames`
            )
        );

    debugProjectConfigurationNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.debuggingEnhancement.debugProjectConfigurationNames`
            )
        );
}
