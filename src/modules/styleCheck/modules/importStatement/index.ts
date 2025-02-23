import { defineModule } from "@/core";

import {
    registerCodeActionsProviderBlankAfterLastImportStatement,
    registerCodeActionsProviderImportStatementsTopOfFile,
} from "./codeActionsProviders";
import { parseConfig } from "./configs";
import {
    registerDiagnosticBlankLineAfterLastImportStatement,
    registerDiagnosticImportStatementsTopOfFile,
} from "./diagnostics";

export const importStatement = defineModule({
    onActive() {
        registerCodeActionsProviderBlankAfterLastImportStatement();
        registerDiagnosticBlankLineAfterLastImportStatement();

        registerCodeActionsProviderImportStatementsTopOfFile();
        registerDiagnosticImportStatementsTopOfFile();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
