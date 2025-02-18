import { defineModule } from "@/core/moduleManager";

import { registerCommandOpenFiles } from "./commands";
import { parseConfigs } from "./configs";

export const openFiles = defineModule({
    onActive() {
        registerCommandOpenFiles();
    },

    onReloadConfiguration() {
        parseConfigs();
    },
});
