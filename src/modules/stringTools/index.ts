import { defineModule } from "@/core/moduleManager";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import {
    registerCommandBase64Decode,
    registerCommandBase64Encode,
} from "./commands";
import { parseConfigs } from "./configs";

export const stringTools = defineModule({
    onActive() {
        registerCommandBase64Encode();
        registerCommandBase64Decode();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
