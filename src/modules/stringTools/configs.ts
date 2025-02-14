import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionCtx, extensionName } from "@/shared/context";

export let enableReplaceText: boolean;
console.log(extensionCtx);

export function parseConfigs() {
    enableReplaceText = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.stringTools.enableReplaceText`
            )
        );
}
