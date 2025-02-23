import { defineModule } from "@/core";

import { parseConfigs } from "./configs";

export const configuration = defineModule({
    onReloadConfiguration() {
        parseConfigs();
    },
});
