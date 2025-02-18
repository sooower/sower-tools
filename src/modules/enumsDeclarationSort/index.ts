import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandSortEnumsDeclaration } from "./commands";

export const enumsDeclarationSort = defineModule({
    onActive() {
        registerCommandSortEnumsDeclaration();
        registerCodeActionsProviders();
    },
});
