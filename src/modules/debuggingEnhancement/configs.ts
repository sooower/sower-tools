import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

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
