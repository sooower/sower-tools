import { defineModule } from "@/shared/moduleManager";

import { registerCommandGenerateAPIResources } from "./commands";

export const apiResourcesGeneration = defineModule({
    onActive() {
        registerCommandGenerateAPIResources();
    },
});
