import { defineModule } from "@/core";

import { registerCommandReferToEnvVariables } from "./commands";
import { parseConfigs } from "./configs";
import { registerListeners } from "./listeners";

export const envVariablesReference = defineModule({
    onActive() {
        registerCommandReferToEnvVariables();
        registerListeners();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
