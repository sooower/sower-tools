import { defineModule } from "@/core/moduleManager";

import {
    registerCodeActionsProviderAddBlankLineBeforeComment,
    registerCodeActionsProviderSuppressCommentWarning,
} from "./codeActionsProviders";
import { parseConfig } from "./configs";
import { registerDiagnosticComment } from "./diagnostics";

export const comment = defineModule({
    onActive() {
        registerDiagnosticComment();

        registerCodeActionsProviderAddBlankLineBeforeComment();
        registerCodeActionsProviderSuppressCommentWarning();
    },
    onReloadConfiguration() {
        parseConfig();
    },
});
