import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

/**
 * The key for encrypt/decrypt text.
 */
export let keyCryptoToolsKey: string;

export function parseConfigs() {
    keyCryptoToolsKey = z
        .string()
        .parse(getConfigurationItem(`${extensionName}.keyCryptoTools.key`));
}
