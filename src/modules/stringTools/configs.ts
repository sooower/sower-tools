import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
