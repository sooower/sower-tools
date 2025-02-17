import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticComment } from "./diagnostics";

export const comment = defineModule({
    onActive() {
        registerDiagnosticComment();
        registerCodeActionsProviders();
    },
});
