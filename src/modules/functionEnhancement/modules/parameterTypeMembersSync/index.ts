import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSyncTypeMembers } from "./commands";

export const parameterTypeMembersSync = defineModule({
    onActive() {
        registerCommandSyncTypeMembers();
        registerCodeActionsProviders();
    },
});
