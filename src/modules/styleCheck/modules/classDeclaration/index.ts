import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticClassDeclaration } from "./diagnostics";

export const classDeclaration = defineModule({
    onActive() {
        registerDiagnosticClassDeclaration();
        registerCodeActionsProviders();
    },
});
