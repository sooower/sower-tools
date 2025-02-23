import { defineModule } from "@/core";

import { registerCommandOpenProjects } from "./commands";
import { parseConfigs } from "./configs";

export const projectsOpen = defineModule({
    onActive() {
        registerCommandOpenProjects();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
