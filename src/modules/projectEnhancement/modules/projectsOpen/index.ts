import { defineModule } from "@/core";

import { registerCommandOpenProjects } from "./commands";
import {
    appendWorkspaceToOpenedProject,
    parseConfigs,
    removeWorkspaceFromOpenedProject,
} from "./configs";

export const projectsOpen = defineModule({
    onActive() {
        registerCommandOpenProjects();
        appendWorkspaceToOpenedProject();
    },
    onDeactive() {
        removeWorkspaceFromOpenedProject();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
