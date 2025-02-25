import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommands } from "./commands";
import { parseConfigs } from "./configs";

export const blankLinesRemoval = defineModule({
    onActive() {
        registerCommands();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
