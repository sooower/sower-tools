import { defineModule } from "@/shared/module";

import { enablePreviewReadmeDocument, parseConfigs } from "./parseConfigs";
import { previewDocument } from "./previewDoc";

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
