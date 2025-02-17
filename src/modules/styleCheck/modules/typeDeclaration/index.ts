import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerDiagnosticTypeDeclaration } from "./diagnostics";

export const typeDeclaration = defineModule({
    onActive() {
        registerCodeActionsProviders();
        registerDiagnosticTypeDeclaration();
    },
});
