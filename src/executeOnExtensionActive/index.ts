import {
    enableShowDefaultOpenedDocument,
    enableShowNowTimestamp,
} from "@/shared/init";

import { showCountdownTimer } from "./showCountdownTimer";
import { showDefaultOpenedDocument } from "./showDefaultOpenedDocument";
import { showNowTimestamp } from "./showTimestamp";

export let timestampStatusBarItemTimer: NodeJS.Timeout | undefined;

export async function executeOnExtensionActive() {
    if (enableShowNowTimestamp) {
        timestampStatusBarItemTimer = showNowTimestamp();
    }

    if (enableShowDefaultOpenedDocument) {
        await showDefaultOpenedDocument();
    }

    await showCountdownTimer();
}
