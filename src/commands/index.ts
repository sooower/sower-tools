import { subscribeCodeActionProviders } from "../codeActionsProviders";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGenerateModel } from "./generateModel";
import { subscribeGitEnhancement } from "./gitEnhancement";

export function subscribeCommandsRegistry() {
    subscribeGenerateModel();
    subscribeDebuggingEnhancement();
    subscribeEnhanceFunction();
    subscribeGenerateEnumAssertionFunction();
    subscribeCodeActionProviders();
    subscribeGitEnhancement();
}
