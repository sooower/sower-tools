import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerSortEnums } from "./commands";

export const sortEnums = defineModule({
    onActive() {
        registerSortEnums();
        registerCodeActionsProviders();
    },
});
