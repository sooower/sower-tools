import { defineModule } from "@/core";

import { registerCommandExpandFolder } from "./commands";
import { parseConfigs } from "./configs";

export const expandFolder = defineModule({
    onActive() {
        registerCommandExpandFolder();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
