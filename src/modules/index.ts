import { defineModule } from "@/shared/moduleManager";

import { apiResourcesGeneration } from "./apiResourcesGeneration";
import { syncChangelog } from "./changelogSync";
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
import { shared } from "./shared";
import { statusBarEnhancement } from "./statusBarEnhancement";
import { stringTools } from "./stringTools";
import { styleCheck } from "./styleCheck";
import { timestampTools } from "./timestampTools";
import { typeOfZodSchemaGeneration } from "./typeOfZodSchemaGeneration";

export const modules = defineModule([
    shared,
    markdownEnhancement,
    timestampTools,
    stringTools,
    syncChangelog,
    readmeDocumentPreview,
    functionEnhancement,
    nodeBuiltinModulesImportsUpdate,
    enumsSort,
    enumAssertionFunctionsGeneration,
    typeOfZodSchemaGeneration,
    databaseModel,
    keyCryptoTools,
    dirEnhancement,
    debuggingEnhancement,
    gitEnhancement,
    apiResourcesGeneration,
    statusBarEnhancement,
    styleCheck,
]);
