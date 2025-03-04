import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let debugCurrentFileConfigurationNames: string[];
export let debugProjectConfigurationNames: string[];

export function parseConfigs() {
    debugCurrentFileConfigurationNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.runEnhancement.debugCurrentFileConfigurationNames`
            )
        );

    debugProjectConfigurationNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.runEnhancement.debugProjectConfigurationNames`
            )
        );
}
