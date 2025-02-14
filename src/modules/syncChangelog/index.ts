import { defineModule } from "@/shared/module";

import { registerCodeActionsProvider } from "./registerCodeActionsProvider";
import { registerCommandSyncChangelog } from "./registerCommandSyncChangelog";

export const syncChangelog = defineModule({
    onActive() {
        registerCommandSyncChangelog();
        registerCodeActionsProvider();
    },
});
