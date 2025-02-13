import { subscribeAPIResources } from "./apiResources";
import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeOpenFilesInDir } from "./dirEnhancement/openFilesInDir";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGenerateTypeSchema } from "./generateSchemaType";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeKeyCryptoTools } from "./keyCryptoTools";
import { subscribeSortEnums } from "./sortEnums";
import { subscribeSyncChangelog } from "./syncChangelog";

export function subscribeCommands() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeEnhanceFunction();
    subscribeGenerateEnumAssertionFunction();
    subscribeGenerateTypeSchema();
    subscribeGitEnhancement();
    subscribeSyncChangelog();
    subscribeSortEnums();
    subscribeAPIResources();
    subscribeKeyCryptoTools();
    subscribeOpenFilesInDir();
}
