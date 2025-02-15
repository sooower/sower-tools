import { subscribeAPIResources } from "./apiResources";
import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeOpenFilesInDir } from "./dirEnhancement/openFilesInDir";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeKeyCryptoTools } from "./keyCryptoTools";

export function subscribeCommands() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeGitEnhancement();
    subscribeAPIResources();
    subscribeKeyCryptoTools();
    subscribeOpenFilesInDir();
}
