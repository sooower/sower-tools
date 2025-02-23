import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

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
