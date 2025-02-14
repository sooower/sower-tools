import { z } from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

export let enablePreviewReadmeDocument: boolean;
export let readmeDocumentNames: string[];

export function parseConfigs() {
    enablePreviewReadmeDocument = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.previewReadmeDocument.enable`
            )
        );
    readmeDocumentNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.previewReadmeDocument.documentNames`
            )
        );
}
