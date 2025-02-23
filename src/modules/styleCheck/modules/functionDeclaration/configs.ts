import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckFunctionDeclaration: boolean;

export function parseConfig() {
    enableStyleCheckFunctionDeclaration = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.functionDeclaration.enable`
            )
        );
}
