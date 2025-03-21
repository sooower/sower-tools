import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticTypeDeclaration } from "./diagnostics";

export const typeDeclaration = defineModule({
    onActive() {
        registerCodeActionsProviders();
        registerDiagnosticTypeDeclaration();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
