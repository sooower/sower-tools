import { defineModule } from "@/shared/moduleManager";

import { enablePreviewReadmeDocument, parseConfigs } from "./configs";
import { previewDocument } from "./utils";

export const previewReadmeDocument = defineModule({
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
