import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticInterfaceDeclaration } from "./diagnostics";

export const interfaceDeclaration = defineModule({
    onActive() {
        registerDiagnosticInterfaceDeclaration();
        registerCodeActionsProviders();
    },
});
