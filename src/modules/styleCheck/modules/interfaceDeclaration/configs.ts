import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
