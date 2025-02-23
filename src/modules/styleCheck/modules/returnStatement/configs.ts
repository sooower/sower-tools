import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckReturnStatement: boolean;

export function parseConfig() {
    enableStyleCheckReturnStatement = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.returnStatement.enable`
            )
        );
}
