import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
