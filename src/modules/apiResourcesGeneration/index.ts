import { defineModule } from "@/core/moduleManager";

import { registerCommandGenerateAPIResources } from "./commands";

export const apiResourcesGeneration = defineModule({
    onActive() {
        registerCommandGenerateAPIResources();
    },
});
