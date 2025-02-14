import { defineModule } from "@/shared/module";

import { registerCodeActionsProvider } from "./codeActionsProviders";
import { registerCommandConvertTimestamp } from "./commands/convertTimestamp";
import { registerCommandInsertTimestamp } from "./commands/insertTimestamp";
import { registerHoverProvider } from "./hoverProviders";

export const timestampTools = defineModule({
    onActive() {
        registerCommandConvertTimestamp();
        registerCommandInsertTimestamp();
        registerHoverProvider();
        registerCodeActionsProvider();
    },
});
