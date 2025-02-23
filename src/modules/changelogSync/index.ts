import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSyncChangelog } from "./commands";

export const changelogSync = defineModule({
    onActive() {
        registerCommandSyncChangelog();
        registerCodeActionsProviders();
    },
});
