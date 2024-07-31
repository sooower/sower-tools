import { timestampStatusBarItemTimer } from "@/executeOnExtensionActive";

export function clearShowTimestampTimer() {
    clearInterval(timestampStatusBarItemTimer);
    console.log(`Timer "timestampStatusBarItemTimer" has clear.`);
}
