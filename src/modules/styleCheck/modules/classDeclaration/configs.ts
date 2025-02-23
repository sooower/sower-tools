import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

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
