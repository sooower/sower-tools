import { defineModule } from "@/shared/module";

import { registerCommandCountdownTimer } from "./commands";
import { parseConfigs } from "./configs";
import { showStatusBarCountdownTimer } from "./timers";

export const countdownTimer = defineModule({
    onActive() {
        registerCommandCountdownTimer();
        showStatusBarCountdownTimer();
    },
    onReloadConfiguration() {
        parseConfigs();
    },
});
