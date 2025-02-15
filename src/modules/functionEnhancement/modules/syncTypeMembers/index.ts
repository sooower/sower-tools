import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSyncTypeMembers } from "./commands";

export const syncTypeMembers = defineModule({
    onActive() {
        registerCommandSyncTypeMembers();
        registerCodeActionsProviders();
    },
});
