import { defineModule } from "@/core";

import { registerCommandReferToApiDocument } from "./commands";
import { parseConfigs } from "./configs";
import { registerListeners } from "./listeners";

export const apiDocumentReference = defineModule({
    onActive() {
        registerCommandReferToApiDocument();
        registerListeners();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
