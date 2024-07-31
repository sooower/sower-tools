import { clearShowTimestampTimer } from "./clearShowTimestampTimer";

export function executeOnExtensionDeactive() {
    clearShowTimestampTimer();
}
