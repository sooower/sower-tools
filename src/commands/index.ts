import { subscribeAPIResources } from "./apiResources";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeOpenFilesInDir } from "./dirEnhancement/openFilesInDir";
import { subscribeGitEnhancement } from "./gitEnhancement";
import { subscribeKeyCryptoTools } from "./keyCryptoTools";

export function subscribeCommands() {
    subscribeDebuggingEnhancement();
    subscribeGitEnhancement();
    subscribeAPIResources();
    subscribeKeyCryptoTools();
    subscribeOpenFilesInDir();
}
