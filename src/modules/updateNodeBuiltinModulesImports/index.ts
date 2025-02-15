import { defineModule } from "@/shared/moduleManager";

import { parseConfigs } from "./configs";
import { registerOnDidSaveTextDocumentListener } from "./listeners";

export const updateNodeBuiltinModulesImports = defineModule({
    onActive() {
        registerOnDidSaveTextDocumentListener();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
