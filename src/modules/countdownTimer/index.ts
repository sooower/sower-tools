import { defineModule } from "@/shared/module";

import { registerCommandCountdownTimer } from "./registerCommandCountdownTimer";
import { showStatusBarCountdownTimer } from "./showStatusBarCountdownTimer";

export const countdownTimer = defineModule({
    onActive() {
        registerCommandCountdownTimer();
        showStatusBarCountdownTimer();
    },
});
