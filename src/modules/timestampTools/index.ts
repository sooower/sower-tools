import { defineModule } from "@/core";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { parseConfigs } from "./configs";
import { registerHoverProvider } from "./hoverProviders";

export const timestampTools = defineModule({
    onActive() {
        registerHoverProvider();
        registerCodeActionsProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
