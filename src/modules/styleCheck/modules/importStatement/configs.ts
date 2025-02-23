import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckImportStatement: boolean;

export function parseConfig() {
    enableStyleCheckImportStatement = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.importStatement.enable`
            )
        );
}
