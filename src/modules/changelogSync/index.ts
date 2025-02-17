import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSyncChangelog } from "./commands";

export const syncChangelog = defineModule({
    onActive() {
        registerCommandSyncChangelog();
        registerCodeActionsProviders();
    },
});
