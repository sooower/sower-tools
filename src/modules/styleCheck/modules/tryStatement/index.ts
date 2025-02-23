import { defineModule } from "@/core";

import { parseConfig } from "./configs";
import { registerDiagnosticTryStatement } from "./diagnostics";

export const tryStatement = defineModule({
    onActive() {
        registerDiagnosticTryStatement();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
