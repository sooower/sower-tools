import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandGenerateModel } from "./commands/generateModel";
import { registerCommandUpdateModel } from "./commands/updateModel";
import { parseConfigs } from "./configs";

export const databaseModel = defineModule({
    onActive() {
        registerCommandGenerateModel();
        registerCommandUpdateModel();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
