import { defineModule } from "@/core";

import { registerCommandGenerateRunbookInfo } from "./commands";
import { parseConfigs } from "./configs";

export const runbookInfoGeneration = defineModule({
    onActive() {
        registerCommandGenerateRunbookInfo();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
