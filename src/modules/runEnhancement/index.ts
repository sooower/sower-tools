import { defineModule } from "@/core";

import { registerCommandDebugCurrentFile } from "./commands/debugCurrentFile";
import { registerCommandDebugProject } from "./commands/debugProject";
import { registerCommandRunProject } from "./commands/runProject";
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
