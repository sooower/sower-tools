import { defineModule } from "@/core";

import { parseConfigs } from "./configs";

export const shared = defineModule({
    onReloadConfiguration() {
        parseConfigs();
    },
});
