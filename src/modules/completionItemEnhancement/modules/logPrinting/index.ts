import { defineModule } from "@/core";

import { registerCompletionItemProviders } from "./completionItemProviders";
import { parseConfigs } from "./configs";

export const logPrinting = defineModule({
    onActive() {
        registerCompletionItemProviders();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
