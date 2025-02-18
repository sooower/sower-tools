import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
