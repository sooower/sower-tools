import { defineModule } from "@/core";

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
