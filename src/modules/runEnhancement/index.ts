import { defineModule } from "@/core";

import {
    registerCommandDebugCurrentFile,
    registerCommandDebugProject,
    registerCommandRunProject,
} from "./commands";
import { parseConfigs } from "./configs";
import { registerListeners } from "./listeners";

export const runEnhancement = defineModule({
    onActive() {
        registerCommandDebugCurrentFile();
        registerCommandDebugProject();
        registerCommandRunProject();
        registerListeners();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
