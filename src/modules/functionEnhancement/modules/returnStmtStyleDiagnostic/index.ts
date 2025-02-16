import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticReturnStmtStyle } from "./diagnostics";

export const returnStmtStyleDiagnostic = defineModule({
    onActive() {
        registerDiagnosticReturnStmtStyle();
        registerCodeActionsProviders();
    },
});
