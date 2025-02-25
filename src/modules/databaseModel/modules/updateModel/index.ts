import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";

export const updateModel = defineModule({
    onActive() {
        registerCodeActionsProviders();
    },
});
