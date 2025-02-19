import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
