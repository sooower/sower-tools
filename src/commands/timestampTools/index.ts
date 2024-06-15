import { subscribeConvertTimestamp } from "./convertTimestamp";
import { subscribeInsertTimestamp } from "./insertTimestamp";

export function subscribeTimestampTool() {
    subscribeConvertTimestamp();
    subscribeInsertTimestamp();
}
