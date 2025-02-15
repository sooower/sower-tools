import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSortEnums } from "./commands";

export const enumsSort = defineModule({
    onActive() {
        registerCommandSortEnums();
        registerCodeActionsProviders();
    },
});
