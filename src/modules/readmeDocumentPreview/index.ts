import { defineModule } from "@/core";

import { enablePreviewReadmeDocument, parseConfigs } from "./configs";
import { previewDocument } from "./utils";

export const readmeDocumentPreview = defineModule({
    onActive() {
        if (enablePreviewReadmeDocument) {
            previewDocument();
        }
    },
    onReloadConfiguration() {
        parseConfigs();

        if (enablePreviewReadmeDocument) {
            previewDocument();
        }
    },
});
