import { defineModule } from "@/shared/utils/module";

import { registerCodeActionProviders } from "./registerCodeActionProviders";
import { registerCommandConvertTimestamp } from "./registerCommandConvertTimestamp";
import { registerCommandInsertTimestamp } from "./registerCommandInsertTimestamp";
import { registerHoverProvider } from "./registerHoverProvider";

export const timestampTools = defineModule({
    onActive() {
        registerCommandConvertTimestamp();
        registerCommandInsertTimestamp();
        registerHoverProvider();
        registerCodeActionProviders();
    },
    onDeactive() {},
});
