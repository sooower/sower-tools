import { defineModule } from "@/shared/module";

import { registerCodeActionsProviders } from "./codeActionsProviders";
import { registerCommandConvertTimestamp } from "./commands/convertTimestamp";
import { registerCommandInsertTimestamp } from "./commands/insertTimestamp";
import { registerHoverProvider } from "./hoverProviders";

export const timestampTools = defineModule({
    onActive() {
        registerCommandConvertTimestamp();
        registerCommandInsertTimestamp();
        registerHoverProvider();
        registerCodeActionsProviders();
    },
});
