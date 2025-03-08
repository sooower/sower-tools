import { defineModule } from "@/core";

import { registerCommandExpandFolder } from "./commands";
import { parseConfigs } from "./configs";

export const folderExpansion = defineModule({
    onActive() {
        registerCommandExpandFolder();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
