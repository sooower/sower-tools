import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSortEnumsDeclaration } from "./commands";

export const enumsDeclarationSort = defineModule({
    onActive() {
        registerCommandSortEnumsDeclaration();
        registerCodeActionsProviders();
    },
});
