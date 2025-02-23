import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandConvertParametersToOptionsObject } from "./commands";

export const parametersObjectOptionsConversion = defineModule({
    onActive() {
        registerCommandConvertParametersToOptionsObject();
        registerCodeActionsProviders();
    },
});
