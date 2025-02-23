import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableShowStatusBarNowTimestamp: boolean;

export function parseShowStatusBarNowTimestampConfigs() {
    enableShowStatusBarNowTimestamp = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.statusBarEnhancement.nowTimestamp.enable`
            )
        );
}
