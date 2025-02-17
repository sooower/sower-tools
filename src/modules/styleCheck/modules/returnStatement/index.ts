import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticReturnStatementStyle } from "./diagnostics";

export const returnStatement = defineModule({
    onActive() {
        registerDiagnosticReturnStatementStyle();
        registerCodeActionsProviders();
    },
});
