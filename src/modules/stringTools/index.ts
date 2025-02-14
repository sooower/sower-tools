import { defineModule } from "@/shared/module";

import { parseConfigs } from "./parseConfigs";
import { registerCodeActionsProvider } from "./registerCodeActionsProvider";
import { registerCommandBase64Decode } from "./registerCommandBase64Decode";
import { registerCommandBase64Encode } from "./registerCommandBase64Encode";

export const stringTools = defineModule({
    onActive() {
        registerCommandBase64Encode();
        registerCommandBase64Decode();
        registerCodeActionsProvider();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
