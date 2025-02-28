import { defineModule } from "@/core";

import { registerCommandReferToEnvVariables } from "./commands";
import { parseConfigs } from "./configs";

export const envVariablesReference = defineModule({
    onActive() {
        registerCommandReferToEnvVariables();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
