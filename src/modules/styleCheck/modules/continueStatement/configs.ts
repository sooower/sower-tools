import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
