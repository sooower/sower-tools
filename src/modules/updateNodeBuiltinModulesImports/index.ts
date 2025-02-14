import { defineModule } from "@/shared/module";

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
