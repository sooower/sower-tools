import { subscribeConvertTimestamp } from "./convertTimestamp";
import { subscribeInsertTimestamp } from "./insertTimestamp";

export function subscribeTimestampTools() {
    subscribeConvertTimestamp();
    subscribeInsertTimestamp();
}
