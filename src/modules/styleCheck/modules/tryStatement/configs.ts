import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckTryStatement: boolean;

export function parseConfig() {
    enableStyleCheckTryStatement = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.tryStatement.enable`
            )
        );
}
