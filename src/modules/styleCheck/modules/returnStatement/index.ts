import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticReturnStatement } from "./diagnostics";

export const returnStatement = defineModule({
    onActive() {
        registerDiagnosticReturnStatement();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
