import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

export let enableStyleCheckClassDeclaration: boolean;

export function parseConfig() {
    enableStyleCheckClassDeclaration = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.classDeclaration.enable`
            )
        );
}
