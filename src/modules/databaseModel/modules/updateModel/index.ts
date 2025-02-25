import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandUpdateModel } from "./commands";

export const updateModel = defineModule({
    onActive() {
        registerCommandUpdateModel();
        registerCodeActionsProviders();
    },
});
