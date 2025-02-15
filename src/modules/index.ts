import { moduleManager } from "@/shared/moduleManager";

import { apiResourcesGeneration } from "./apiResourcesGeneration";
import { syncChangelog } from "./changelogSync";
import { common } from "./common";
import { databaseModel } from "./databaseModel";
import { debuggingEnhancement } from "./debuggingEnhancement";
import { dirEnhancement } from "./dirEnhancement";
import { enumAssertionFunctionsGeneration } from "./enumAssertionFunctionsGeneration";
import { enumsSort } from "./enumsSort";
import { functionEnhancement } from "./functionEnhancement";
import { gitEnhancement } from "./gitEnhancement";
import { keyCryptoTools } from "./keyCryptoTools";
import { markdownEnhancement } from "./markdownEnhancement";
import { nodeBuiltinModulesImportsUpdate } from "./nodeBuiltinModulesImportsUpdate";
import { readmeDocumentPreview } from "./readmeDocumentPreview";
import { statusBarEnhancement } from "./statusBarEnhancement";
import { stringTools } from "./stringTools";
import { timestampTools } from "./timestampTools";
import { typeOfZodSchemaGeneration } from "./typeOfZodSchemaGeneration";

/**
 * Register all sub modules.
 */
export function registerModules() {
    moduleManager.registerModule(common);
    moduleManager.registerModule(markdownEnhancement.localImage);
    moduleManager.registerModule(timestampTools);
    moduleManager.registerModule(stringTools);
    moduleManager.registerModule(syncChangelog);
    moduleManager.registerModule(readmeDocumentPreview);
    moduleManager.registerModule(
        functionEnhancement.parametersObjectOptionsConversion
    );
    moduleManager.registerModule(functionEnhancement.parameterTypeMembersSync);
    moduleManager.registerModule(functionEnhancement.parameterTypeNameSync);
    moduleManager.registerModule(nodeBuiltinModulesImportsUpdate);
    moduleManager.registerModule(enumsSort);
    moduleManager.registerModule(enumAssertionFunctionsGeneration);
    moduleManager.registerModule(typeOfZodSchemaGeneration);
    moduleManager.registerModule(databaseModel);
    moduleManager.registerModule(keyCryptoTools);
    moduleManager.registerModule(dirEnhancement.openFiles);
    moduleManager.registerModule(debuggingEnhancement);
    moduleManager.registerModule(gitEnhancement);
    moduleManager.registerModule(apiResourcesGeneration);
    moduleManager.registerModule(statusBarEnhancement.countdownTimer);
    moduleManager.registerModule(statusBarEnhancement.nowTimestamp);
    moduleManager.registerModule(statusBarEnhancement.selectedLines);
}
