import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableStyleCheckComment: boolean;
export let skipCheckCharacter: string;

export function parseConfig() {
    enableStyleCheckComment = z
        .boolean()
        .parse(
            getConfigurationItem(`${extensionName}.styleCheck.comment.enable`)
        );

    skipCheckCharacter = z
        .string()
        .length(1)
        .parse(
            getConfigurationItem(
                `${extensionName}.styleCheck.comment.skipCheckCharacter`
            )
        );
}
