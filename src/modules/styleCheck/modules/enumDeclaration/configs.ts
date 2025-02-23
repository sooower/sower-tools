import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckEnumDeclaration: boolean;

export function parseConfig() {
    enableStyleCheckEnumDeclaration = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.enumDeclaration.enable`
            )
        );
}
