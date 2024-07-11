import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGenerateTypeSchema } from "./generateSchemaType";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeSortEnums } from "./sortEnums";
import { subscribeStringTools } from "./stringTools";
import { subscribeSyncChangelog } from "./syncChangelog";
import { subscribeTimestampTools } from "./timestampTools";

export function subscribeCommands() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeEnhanceFunction();
    subscribeGenerateEnumAssertionFunction();
    subscribeGenerateTypeSchema();
    subscribeGitEnhancement();
    subscribeTimestampTools();
    subscribeStringTools();
    subscribeSyncChangelog();
    subscribeSortEnums();
}
