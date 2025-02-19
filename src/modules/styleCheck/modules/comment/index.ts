import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticComment } from "./diagnostics";

export const comment = defineModule({
    onActive() {
        registerDiagnosticComment();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
