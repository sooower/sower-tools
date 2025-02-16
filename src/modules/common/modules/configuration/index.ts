import { defineModule } from "@/shared/moduleManager";

import { parseConfigs } from "./configs";

export const configuration = defineModule({
    onReloadConfiguration() {
        parseConfigs();
    },
});
