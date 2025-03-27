import { defineModule } from "@/core";

import { registerCodeActionProviderAddToInsertOptions } from "./addToInsertOptions/codeActionProvider";
import { registerCommandAddToInsertOptions } from "./addToInsertOptions/command";
import { registerCodeActionProviderAddToUpdateOptions } from "./addToUpdateOptions/codeActionProvider";
import { registerCommandAddToUpdateOptions } from "./addToUpdateOptions/command";
import { registerCheckColumnsStatusListeners } from "./checkColumnsStatus";
import { parseConfigs } from "./configs";
import { registerCodeActionProviderGenerateModel } from "./generateModel/codeActionsProvider";
import { registerCommandGenerateModel } from "./generateModel/command";
import { registerCodeActionProviderRemoveFromInsertOptions } from "./removeFromInsertOptions/codeActionProvider";
import { registerCommandRemoveFromInsertOptions } from "./removeFromInsertOptions/command";
import { registerCodeActionProviderRemoveFromUpdateOptions } from "./removeFromUpdateOptions/codeActionProvider";
import { registerCommandRemoveFromUpdateOptions } from "./removeFromUpdateOptions/command";
import { registerCodeActionProviderUpdateModel } from "./updateModel/codeActionProvider";
import { registerCommandUpdateModel } from "./updateModel/command";

export const databaseModel = defineModule({
    onActive() {
        registerCommandGenerateModel();
        registerCodeActionProviderGenerateModel();

        registerCommandUpdateModel();
        registerCodeActionProviderUpdateModel();

        registerCommandAddToInsertOptions();
        registerCodeActionProviderAddToInsertOptions();

        registerCommandRemoveFromInsertOptions();
        registerCodeActionProviderRemoveFromInsertOptions();

        registerCommandAddToUpdateOptions();
        registerCodeActionProviderAddToUpdateOptions();

        registerCommandRemoveFromUpdateOptions();
        registerCodeActionProviderRemoveFromUpdateOptions();

        registerCheckColumnsStatusListeners();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
