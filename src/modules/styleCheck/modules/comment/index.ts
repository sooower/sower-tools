import { defineModule } from "@/core";

import { registerCodeActionsProviderAddBlankLineBeforeComment } from "./codeActionsProviders/addBlankLineBeforeComment";
import { registerCodeActionsProviderSuppressCommentWarning } from "./codeActionsProviders/suppressCommentWarning";
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
