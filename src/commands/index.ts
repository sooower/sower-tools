import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeStringTools } from "./stringTools";
import { subscribeTimestampTools } from "./timestampTools";

export function subscribeCommands() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeEnhanceFunction();
    subscribeGenerateEnumAssertionFunction();
    subscribeGitEnhancement();
    subscribeTimestampTools();
    subscribeStringTools();
}
