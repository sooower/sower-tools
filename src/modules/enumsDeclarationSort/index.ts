import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";

export const enumsDeclarationSort = defineModule({
    onActive() {
        registerCodeActionsProviders();
    },
});
