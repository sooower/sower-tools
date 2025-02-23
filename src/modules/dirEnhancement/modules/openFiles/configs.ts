import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let ignoredFilenames: string[];

export function parseConfigs() {
    ignoredFilenames = z
        .string()
        .array()
        .parse(
            getConfigurationItem(
                `${extensionName}.dirEnhancement.openFiles.ignoredFilenames`
            )
        );
}
