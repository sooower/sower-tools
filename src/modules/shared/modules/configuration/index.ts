import { defineModule } from "@/core/moduleManager";

import { parseConfigs } from "./configs";

export const configuration = defineModule({
    onReloadConfiguration() {
        parseConfigs();
    },
});
