import { defineModule } from "@/shared/module";

import { registerCodeActionsProvider } from "./codeActionsProviders";
import { registerCommandBase64Decode } from "./commands/base64Decode";
import { registerCommandBase64Encode } from "./commands/base64Encode";
import { parseConfigs } from "./configs";

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
