import { defineModule } from "@/shared/utils/module";

import { registerCodeActionsProvider } from "./registerCodeActionsProvider";
import { registerCommandConvertTimestamp } from "./registerCommandConvertTimestamp";
import { registerCommandInsertTimestamp } from "./registerCommandInsertTimestamp";
import { registerHoverProvider } from "./registerHoverProvider";

export const timestampTools = defineModule({
    onActive() {
        registerCommandConvertTimestamp();
        registerCommandInsertTimestamp();
        registerHoverProvider();
        registerCodeActionsProvider();
    },
    onDeactive() {},
});
