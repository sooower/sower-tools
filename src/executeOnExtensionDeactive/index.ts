import { enableShowNowTimestamp } from "@/shared/init";

import { clearShowTimestampTimer } from "./clearShowTimestampTimer";

export function executeOnExtensionDeactive() {
    if (enableShowNowTimestamp) {
        clearShowTimestampTimer();
    }
}
