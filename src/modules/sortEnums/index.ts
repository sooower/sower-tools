import { defineModule } from "@/shared/module";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerSortEnums } from "./commands";

export const sortEnums = defineModule({
    onActive() {
        registerSortEnums();
        registerCodeActionsProviders();
    },
});
