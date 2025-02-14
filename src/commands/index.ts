import { subscribeAPIResources } from "./apiResources";
import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeOpenFilesInDir } from "./dirEnhancement/openFilesInDir";
import { subscribeGenerateTypeSchema } from "./generateSchemaType";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeKeyCryptoTools } from "./keyCryptoTools";

export function subscribeCommands() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeGenerateTypeSchema();
    subscribeGitEnhancement();
    subscribeAPIResources();
    subscribeKeyCryptoTools();
    subscribeOpenFilesInDir();
}
