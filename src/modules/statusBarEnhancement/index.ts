import { defineModule } from "@/shared/moduleManager";

import { countdownTimer } from "./modules/countdownTimer";
import { nowTimestamp } from "./modules/nowTimestamp";
import { selectedLines } from "./modules/selectedLines";

export const statusBarEnhancement = defineModule([
    nowTimestamp,
    selectedLines,
    countdownTimer,
]);
