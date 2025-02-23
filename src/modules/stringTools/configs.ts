import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableReplaceText: boolean;

export function parseConfigs() {
    enableReplaceText = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.stringTools.enableReplaceText`
            )
        );
}
