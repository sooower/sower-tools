import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandRemoveBlankLines } from "./commands";
import { parseConfigs } from "./configs";

export const blankLinesRemoval = defineModule({
    onActive() {
        parseConfigs();
        registerCommandRemoveBlankLines();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
