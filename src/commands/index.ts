import { subscribeAPIResources } from "./apiResources";
import { subscribeGitEnhancement } from "./gitEnhancement";

export function subscribeCommands() {
    subscribeGitEnhancement();
    subscribeAPIResources();
}
