import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticBreakStatement } from "./diagnostics";

export const breakStatement = defineModule({
    onActive() {
        registerDiagnosticBreakStatement();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
