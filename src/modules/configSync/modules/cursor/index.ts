import { defineModule } from "@/core";

import {
    registerCommandPullCursorProfile,
    registerCommandPushCursorProfile,
} from "./commands";
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
