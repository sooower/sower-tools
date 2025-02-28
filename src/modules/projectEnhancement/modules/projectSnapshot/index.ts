import { defineModule } from "@/core";

import { loadIgnorePatterns, parseConfigs } from "./configs";
import { registerListeners } from "./listeners";

export const projectSnapshot = defineModule({
    onActive() {
        registerListeners();
    },
    onReloadConfiguration() {
        parseConfigs();
        loadIgnorePatterns();
    },
});
