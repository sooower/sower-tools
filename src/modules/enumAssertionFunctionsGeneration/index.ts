import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateEnumAssertionFunctions } from "./commands";

export const enumAssertionFunctionsGeneration = defineModule({
    onActive() {
        registerCommandGenerateEnumAssertionFunctions();
        registerCodeActionsProviders();
    },
});
