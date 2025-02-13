import { defineModule } from "@/shared/utils/module";

import { registerCodeActionsProvider } from "./registerCodeActionsProvider";
import { registerCommandBase64Decode } from "./registerCommandBase64Decode";
import { registerCommandBase64Encode } from "./registerCommandBase64Encode";

export const stringTools = defineModule({
    onActive() {
        registerCommandBase64Encode();
        registerCommandBase64Decode();
        registerCodeActionsProvider();
    },
    onDeactive() {},
});
