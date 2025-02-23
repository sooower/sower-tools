import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckContinueStatement: boolean;

export function parseConfig() {
    enableStyleCheckContinueStatement = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.continueStatement.enable`
            )
        );
}
