import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticFunctionDeclaration } from "./diagnostics";

export const functionDeclaration = defineModule({
    onActive() {
        registerDiagnosticFunctionDeclaration();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
