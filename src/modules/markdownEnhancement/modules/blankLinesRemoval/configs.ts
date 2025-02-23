import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let languageIds: string[];
export let skipFirstLine: boolean;

export function parseConfigs() {
    languageIds = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.markdownEnhancement.blankLinesRemoval.languageIds`
            )
        );

    skipFirstLine = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.markdownEnhancement.blankLinesRemoval.skipFirstLine`
            )
        );
}
