import { defineModule } from "@/core";

import { parseConfigs } from "./configs";
import { watchWorkspaceFiles } from "./watchers";

export const projectSnapshot = defineModule({
    async onActive() {
        await watchWorkspaceFiles();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
