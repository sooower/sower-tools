import { enableShowNowTimestamp } from "@/shared/init";
import { defineModule } from "@/shared/utils/module";

import { clearShowTimestampTimer } from "./clearShowTimestampTimer";
import { registerCountdownTimer } from "./registerCommandCountdownTimer";
import { showCountdownTimer } from "./showCountdownTimer";

export const countdownTimer = defineModule({
    onActive() {
        registerCountdownTimer();
        showCountdownTimer();
    },
    onDeactive() {
        if (enableShowNowTimestamp) {
            clearShowTimestampTimer();
        }
    },
});
