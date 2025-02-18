import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticBreakStatement } from "./diagnostics";

export const breakStatement = defineModule({
    onActive() {
        registerDiagnosticBreakStatement();
        registerCodeActionsProviders();
    },

    onReloadConfiguration() {
        parseConfig();
    },
});
