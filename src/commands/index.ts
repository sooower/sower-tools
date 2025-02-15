import { subscribeAPIResources } from "./apiResources";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeOpenFilesInDir } from "./dirEnhancement/openFilesInDir";
import { subscribeGitEnhancement } from "./gitEnhancement";

export function subscribeCommands() {
    subscribeDebuggingEnhancement();
    subscribeGitEnhancement();
    subscribeAPIResources();
    subscribeOpenFilesInDir();
}
