import { subscribeCodeActionProviders } from "../codeActionsProviders";
import { subscribeDatabaseModel } from "./databaseModel";
import { subscribeDebuggingEnhancement } from "./debuggingEnhancement";
import { subscribeEnhanceFunction } from "./functionEnhancement";
import { subscribeGenerateEnumAssertionFunction } from "./generateEnumAssertionFunction";
import { subscribeGitEnhancement } from "./gitEnhancement";

export function subscribeCommandsRegistry() {
    subscribeDatabaseModel();
    subscribeDebuggingEnhancement();
    subscribeEnhanceFunction();
    subscribeGenerateEnumAssertionFunction();
    subscribeCodeActionProviders();
    subscribeGitEnhancement();
}
