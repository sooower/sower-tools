import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateTypeOfZodSchema } from "./commands";

export const typeOfZodSchemaGeneration = defineModule({
    onActive() {
        registerCommandGenerateTypeOfZodSchema();
        registerCodeActionsProviders();
    },
});
