import { defineModule } from "@/shared/moduleManager";

import { parseShowStatusBarNowTimestampConfigs } from "./configs";
import {
    clearNowTimestampStatusBarItemTimer,
    refreshNowTimestampStatusBarItem,
} from "./statusBarItems";

export const nowTimestamp = defineModule({
    onActive() {
        refreshNowTimestampStatusBarItem();
    },
    onDeactive() {
        clearNowTimestampStatusBarItemTimer();
    },
    onReloadConfiguration() {
        parseShowStatusBarNowTimestampConfigs();
        refreshNowTimestampStatusBarItem();
    },
});
