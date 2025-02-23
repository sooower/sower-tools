import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckInterfaceDeclaration: boolean;

export function parseConfig() {
    enableStyleCheckInterfaceDeclaration = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.interfaceDeclaration.enable`
            )
        );
}
