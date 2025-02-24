import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let timestampFormat: string;

export function parseConfigs() {
    timestampFormat = z
        .string()
        .min(1)
        .parse(
            getConfigurationItem(
                `${extensionName}.timestampTools.timestampFormat`
            )
        );
}
