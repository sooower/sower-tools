import { defineModule } from "@/shared/moduleManager";

import { registerCommandDebugCurrentFile } from "./commands/debugCurrentFile";
import { registerCommandDebugProject } from "./commands/debugProject";
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
