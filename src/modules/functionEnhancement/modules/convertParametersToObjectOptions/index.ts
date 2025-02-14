import { defineModule } from "@/shared/module";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandConvertParametersToOptionsObject } from "./commands";

export const convertParametersToObjectOptions = defineModule({
    onActive() {
        registerCommandConvertParametersToOptionsObject();
        registerCodeActionsProviders();
    },
});
