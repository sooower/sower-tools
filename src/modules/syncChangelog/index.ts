import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSyncChangelog } from "./commands";

export const syncChangelog = defineModule({
    onActive() {
        registerCommandSyncChangelog();
        registerCodeActionsProviders();
    },
});
