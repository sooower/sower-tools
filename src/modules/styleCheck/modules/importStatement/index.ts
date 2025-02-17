import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticImportStatement } from "./diagnostics";

export const importStatement = defineModule({
    onActive() {
        registerCodeActionsProviders();
        registerDiagnosticImportStatement();
    },
});
