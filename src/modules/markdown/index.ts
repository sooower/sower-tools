import { defineModule } from "@/shared/module";

import { parseConfigs } from "./parseConfigs";
import { registerDiagnostics } from "./registerDiagnostics";

export const markdown = defineModule({
    onActive() {
        registerDiagnostics();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
