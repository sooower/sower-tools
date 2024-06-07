import { subscribeCodeActionProviders } from "../codeActionsProviders";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGenerateModel } from "./generateModel";

export function subscribeCommandsRegistry() {
    subscribeGenerateModel();
    subscribeDebuggingEnhancement();
    subscribeEnhanceFunction();
    subscribeGenerateEnumAssertionFunction();
    subscribeCodeActionProviders();
}
