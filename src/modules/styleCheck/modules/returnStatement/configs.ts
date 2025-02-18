import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
