import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateTypeOfZodSchema } from "./commands";

export const typeOfZodSchemaGeneration = defineModule({
    onActive() {
        registerCommandGenerateTypeOfZodSchema();
        registerCodeActionsProviders();
    },
});
