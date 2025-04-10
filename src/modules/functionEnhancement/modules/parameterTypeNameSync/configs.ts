import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableParameterTypeNameSync: boolean;

export function parseConfigs() {
    enableParameterTypeNameSync = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.functionEnhancement.parameterTypeNameSync.enable`
            )
        );
}
