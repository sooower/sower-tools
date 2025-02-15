import { subscribeAPIResources } from "./apiResources";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeGitEnhancement } from "./gitEnhancement";

export function subscribeCommands() {
    subscribeDebuggingEnhancement();
    subscribeGitEnhancement();
    subscribeAPIResources();
}
