import { enableShowDefaultOpenedDocument } from "@/shared/init";

import { showDefaultOpenedDocument } from "./showDefaultOpenedDocument";
import { showNowTimestamp } from "./showTimestamp";

export let timestampStatusBarItemTimer: NodeJS.Timeout | undefined;

export async function executeOnExtensionActive() {
    timestampStatusBarItemTimer = showNowTimestamp();

    if (enableShowDefaultOpenedDocument) {
        await showDefaultOpenedDocument();
    }
}
