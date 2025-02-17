import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

const patternSchema = z.object({
    trigger: z.string().nonempty(),
    replacement: z.string().nonempty(),
});

export type TPattern = z.infer<typeof patternSchema>;

export let patterns: TPattern[];

export function parseConfigs() {
    patterns = z
        .array(patternSchema)
        .parse(
            getConfigurationItem(
                `${extensionName}.completionItemEnhancement.logPrinting.patterns`
            )
        );
}
