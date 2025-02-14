import { defineModule } from "@/shared/module";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSyncTypeMembers } from "./commands";

export const syncTypeMembers = defineModule({
    onActive() {
        registerCommandSyncTypeMembers();
        registerCodeActionsProviders();
    },
});
