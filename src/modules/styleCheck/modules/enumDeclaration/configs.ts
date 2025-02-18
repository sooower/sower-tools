import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
