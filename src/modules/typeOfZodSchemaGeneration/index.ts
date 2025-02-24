import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";

export const typeOfZodSchemaGeneration = defineModule({
    onActive() {
        registerCodeActionsProviders();
    },
});
