import { defineModule } from "@/core/moduleManager";

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
