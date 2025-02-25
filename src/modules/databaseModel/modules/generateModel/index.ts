import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateModel } from "./commands";

export const generateModel = defineModule({
    onActive() {
        registerCommandGenerateModel();
        registerCodeActionsProviders();
    },
});
