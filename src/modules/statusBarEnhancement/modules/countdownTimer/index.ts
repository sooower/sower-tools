import { defineModule } from "@/core";

import { registerCommandCountdownTimer } from "./commands";
import { parseConfigs } from "./configs";
import { showStatusBarCountdownTimer } from "./statusBarItem";

export const countdownTimer = defineModule({
    onActive() {
        registerCommandCountdownTimer();
        showStatusBarCountdownTimer();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
