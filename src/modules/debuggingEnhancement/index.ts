import { defineModule } from "@/core";

import {
    registerCommandDebugCurrentFile,
    registerCommandDebugProject,
} from "./commands";
import { parseConfigs } from "./configs";

export const debuggingEnhancement = defineModule({
    onActive() {
        registerCommandDebugCurrentFile();
        registerCommandDebugProject();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
