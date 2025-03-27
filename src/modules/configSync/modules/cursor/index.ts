import { defineModule } from "@/core";

import { registerCommandPullCursorProfile } from "./commands/pullProfile";
import { registerCommandPushCursorProfile } from "./commands/pushProfile";
import { parseConfigs } from "./configs";

export const cursor = defineModule({
    onActive() {
        registerCommandPushCursorProfile();
        registerCommandPullCursorProfile();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
