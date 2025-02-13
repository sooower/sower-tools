import { enableShowNowTimestamp } from "@/shared/init";
import { defineModule } from "@/shared/utils/module";

import { clearShowTimestampTimer } from "./clearShowTimestampTimer";
import { registerCommandCountdownTimer } from "./registerCommandCountdownTimer";
import { showStatusBarCountdownTimer } from "./showStatusBarCountdownTimer";

export const countdownTimer = defineModule({
    onActive() {
        registerCommandCountdownTimer();
        showStatusBarCountdownTimer();
    },
    onDeactive() {
        if (enableShowNowTimestamp) {
            clearShowTimestampTimer();
        }
    },
});
