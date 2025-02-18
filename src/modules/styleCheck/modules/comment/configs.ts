import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

export let enableStyleCheckComment: boolean;

export function parseConfig() {
    enableStyleCheckComment = z
        .boolean()
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.comment.enable`)
        );
}
