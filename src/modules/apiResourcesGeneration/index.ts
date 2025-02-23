import { defineModule } from "@/core";

import { registerCommandGenerateAPIResources } from "./commands";

export const apiResourcesGeneration = defineModule({
    onActive() {
        registerCommandGenerateAPIResources();
    },
});
