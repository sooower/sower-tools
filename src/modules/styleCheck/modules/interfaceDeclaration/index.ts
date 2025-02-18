import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticInterfaceDeclaration } from "./diagnostics";

export const interfaceDeclaration = defineModule({
    onActive() {
        registerDiagnosticInterfaceDeclaration();
        registerCodeActionsProviders();
    },

    onReloadConfiguration() {
        parseConfig();
    },
});
