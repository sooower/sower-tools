import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import {
    registerCommandConvertTimestamp,
    registerCommandInsertTimestamp,
} from "./commands";
import { registerHoverProvider } from "./hoverProviders";

export const timestampTools = defineModule({
    onActive() {
        registerCommandConvertTimestamp();
        registerCommandInsertTimestamp();
        registerHoverProvider();
        registerCodeActionsProviders();
    },
});
