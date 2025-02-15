import { defineModule } from "@/shared/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandConvertParametersToOptionsObject } from "./commands";

export const convertParametersToObjectOptions = defineModule({
    onActive() {
        registerCommandConvertParametersToOptionsObject();
        registerCodeActionsProviders();
    },
});
