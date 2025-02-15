import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

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
