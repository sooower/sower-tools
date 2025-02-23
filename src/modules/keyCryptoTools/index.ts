import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import {
    registerCommandKeyDecrypt,
    registerCommandKeyEncrypt,
} from "./commands";
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
