import { defineModule } from "@/shared/utils/module";

import { registerCodeActionsProvider } from "./registerCodeActionsProvider";
import { registerCommandSyncChangelog } from "./registerCommandSyncChangelog";

export const syncChangelog = defineModule({
    onActive() {
        registerCommandSyncChangelog();
        registerCodeActionsProvider();
    },
    onDeactive() {},
});
