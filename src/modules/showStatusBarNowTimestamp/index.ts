import { defineModule } from "@/shared/module";

import { parseShowStatusBarNowTimestampConfigs } from "./configs";
import {
    clearNowTimestampStatusBarItemTimer,
    refreshNowTimestampStatusBarItem,
} from "./statusBarItems";

export const showStatusBarNowTimestamp = defineModule({
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
