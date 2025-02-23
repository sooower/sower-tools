import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import {
    registerCommandGenerateModel,
    registerCommandUpdateModel,
} from "./commands";
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
