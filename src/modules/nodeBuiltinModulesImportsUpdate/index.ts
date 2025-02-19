import { defineModule } from "@/core/moduleManager";

import { parseConfigs } from "./configs";
import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const nodeBuiltinModulesImportsUpdate = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
