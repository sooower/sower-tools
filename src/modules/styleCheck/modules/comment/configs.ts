import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckComment: boolean;
export let skipCheckCharacters: string[];

export function parseConfig() {
    enableStyleCheckComment = z
        .boolean()
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.comment.enable`)
        );

    skipCheckCharacters = z
        .array(z.string().length(1))
        .min(1)
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.comment.skipCheckCharacters`
            )
        );
}
