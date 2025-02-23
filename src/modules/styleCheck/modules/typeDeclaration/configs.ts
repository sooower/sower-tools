import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckTypeDeclaration: boolean;

export function parseConfig() {
    enableStyleCheckTypeDeclaration = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.typeDeclaration.enable`
            )
        );
}
