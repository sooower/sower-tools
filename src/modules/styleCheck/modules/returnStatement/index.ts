import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticReturnStatement } from "./diagnostics";

export const returnStatement = defineModule({
    onActive() {
        registerDiagnosticReturnStatement();
        registerCodeActionsProviders();
    },
});
