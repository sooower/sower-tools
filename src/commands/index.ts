import { subscribeAPIResources } from "./apiResources";
import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeOpenFilesInDir } from "./dirEnhancement/openFilesInDir";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGenerateTypeSchema } from "./generateSchemaType";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeKeyCryptoTools } from "./keyCryptoTools";
import { subscribeSortEnums } from "./sortEnums";

export function subscribeCommands() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeGenerateEnumAssertionFunction();
    subscribeGenerateTypeSchema();
    subscribeGitEnhancement();
    subscribeSortEnums();
    subscribeAPIResources();
    subscribeKeyCryptoTools();
    subscribeOpenFilesInDir();
}
