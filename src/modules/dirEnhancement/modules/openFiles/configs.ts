import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

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
