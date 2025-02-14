import { defineModule } from "@/shared/module";

import { parseConfigs } from "./configs";
import { registerDiagnostics } from "./diagnostics";

export const markdown = defineModule({
    onActive() {
        registerDiagnostics();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
