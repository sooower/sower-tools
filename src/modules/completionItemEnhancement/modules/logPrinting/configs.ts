import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

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
