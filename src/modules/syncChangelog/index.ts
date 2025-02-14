import { defineModule } from "@/shared/module";

import { registerCodeActionsProvider } from "./codeActionsProviders";
import { registerCommandSyncChangelog } from "./commands";

export const syncChangelog = defineModule({
    onActive() {
        registerCommandSyncChangelog();
        registerCodeActionsProvider();
    },
});
