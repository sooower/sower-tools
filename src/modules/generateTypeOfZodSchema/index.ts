import { defineModule } from "@/shared/module";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateTypeOfZodSchema } from "./commands";

export const generateTypeOfZodSchema = defineModule({
    onActive() {
        registerCommandGenerateTypeOfZodSchema();
        registerCodeActionsProviders();
    },
});
