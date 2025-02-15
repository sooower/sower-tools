import { defineModule } from "@/shared/moduleManager";

import { parseConfigs } from "./configs";

export const common = defineModule({
    onReloadConfiguration() {
        parseConfigs();
    },
});
