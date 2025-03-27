import { defineModule } from "@/core";

import { registerCodeActionsProviderBlankAfterLastImportStatement } from "./codeActionsProviders/blankLineAfterLastImportStatement";
import { registerCodeActionsProviderImportStatementsTopOfFile } from "./codeActionsProviders/importStatementsTopOfFile";
import { parseConfig } from "./configs";
import { registerDiagnosticBlankLineAfterLastImportStatement } from "./diagnostics/blankLineAfterLastImportStatement";
import { registerDiagnosticImportStatementsTopOfFile } from "./diagnostics/importStatementsTopOfFile";

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
