import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticEnumDeclaration } from "./diagnostics";

export const enumDeclaration = defineModule({
    onActive() {
        registerDiagnosticEnumDeclaration();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
