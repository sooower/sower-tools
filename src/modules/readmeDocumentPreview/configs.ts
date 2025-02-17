import { z } from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

export let enablePreviewReadmeDocument: boolean;
export let readmeDocumentNames: string[];

export function parseConfigs() {
    enablePreviewReadmeDocument = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.readmeDocumentPreview.enable`
            )
        );
    readmeDocumentNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.readmeDocumentPreview.documentNames`
            )
        );
}
