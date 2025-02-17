import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
