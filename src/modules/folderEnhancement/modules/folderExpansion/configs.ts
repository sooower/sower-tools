import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let ignoredFilenames: string[];
export let openFileDelay: number;

export function parseConfigs() {
    ignoredFilenames = z
        .string()
        .array()
        .parse(
            getConfigurationItem(
                `${extensionName}.folderEnhancement.folderExpansion.ignoredFilenames`
            )
        );
    openFileDelay = z
        .number()
        .min(0)
        .default(20)
        .parse(
            getConfigurationItem(
                `${extensionName}.folderEnhancement.folderExpansion.openFileDelay`
            )
        );
}
