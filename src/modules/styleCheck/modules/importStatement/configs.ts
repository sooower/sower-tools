import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
