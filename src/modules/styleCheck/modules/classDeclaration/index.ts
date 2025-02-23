import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticClassDeclaration } from "./diagnostics";

export const classDeclaration = defineModule({
    onActive() {
        registerDiagnosticClassDeclaration();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
