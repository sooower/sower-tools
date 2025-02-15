import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateEnumAssertionFunctions } from "./commands";

export const generateEnumAssertionFunctions = defineModule({
    onActive() {
        registerCommandGenerateEnumAssertionFunctions();
        registerCodeActionsProviders();
    },
});
