import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticCommentStyle } from "./diagnostics";

export const comment = defineModule({
    onActive() {
        registerDiagnosticCommentStyle();
        registerCodeActionsProviders();
    },
});
