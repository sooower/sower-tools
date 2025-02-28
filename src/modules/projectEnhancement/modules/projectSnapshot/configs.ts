import z from "zod";

import { extensionName, getConfigurationItem, os } from "@/core";

export let enableProjectSnapshot: boolean;
export let maxLegacyVersions: number;
export let snapshotRootPath: string;
export let ignorePatterns: string[];

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

    snapshotRootPath = z
        .string()
        .parse(
            getConfigurationItem(
                `${extensionName}.projectEnhancement.projectSnapshot.snapshotRootPath`
            )
        )
        .replace(/^~/, os.homedir());

    ignorePatterns = z
        .array(z.string())
        .default([])
        .parse(
            getConfigurationItem(
                `${extensionName}.projectEnhancement.projectSnapshot.ignorePatterns`
            )
        );
}
