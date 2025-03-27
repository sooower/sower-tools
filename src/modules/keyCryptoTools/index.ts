import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandKeyDecrypt } from "./commands/keyDecrypt";
import { registerCommandKeyEncrypt } from "./commands/keyEncrypt";
import { parseConfigs } from "./configs";

export const keyCryptoTools = defineModule({
    onActive() {
        registerCommandKeyEncrypt();
        registerCommandKeyDecrypt();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
