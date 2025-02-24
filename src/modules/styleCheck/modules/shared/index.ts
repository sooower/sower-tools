import { defineModule } from "@/core";

import { loadIgnorePatterns, parseConfigs } from "./configs";
import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const shared = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
    onReloadConfiguration() {
        parseConfigs();
        loadIgnorePatterns();
    },
});
