import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

export let enableStyleCheckBreakStatement: boolean;

export function parseConfig() {
    enableStyleCheckBreakStatement = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.breakStatement.enable`
            )
        );
}
