import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

/**
 * The key for encrypt/decrypt text.
 */
export let keyCryptoToolsKey: string;

export function parseConfigs() {
    keyCryptoToolsKey = z
        .string()
        .parse(getConfigurationItem(`${extensionName}.keyCryptoTools.key`));
}
