import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

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
