import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

export let enableShowStatusBarNowTimestamp: boolean;

export function parseShowStatusBarNowTimestampConfigs() {
    enableShowStatusBarNowTimestamp = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.showStatusBarNowTimestamp.enable`
            )
        );
}
