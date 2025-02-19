import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticContinueStatement } from "./diagnostics";

export const continueStatement = defineModule({
    onActive() {
        registerDiagnosticContinueStatement();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
