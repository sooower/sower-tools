import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticImportStatement } from "./diagnostics";

export const importStatement = defineModule({
    onActive() {
        registerCodeActionsProviders();
        registerDiagnosticImportStatement();
    },

    onReloadConfiguration() {
        parseConfig();
    },
});
