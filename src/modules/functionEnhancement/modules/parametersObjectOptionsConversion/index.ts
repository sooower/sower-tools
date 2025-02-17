import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandConvertParametersToOptionsObject } from "./commands";

export const parametersObjectOptionsConversion = defineModule({
    onActive() {
        registerCommandConvertParametersToOptionsObject();
        registerCodeActionsProviders();
    },
});
