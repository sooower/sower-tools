import { defineModule } from "@/core";

import { apiRequestAssistant } from "./apiRequestAssistant";
import { apiResourcesGeneration } from "./apiResourcesGeneration";
import { changelogSync } from "./changelogSync";
import { completionItemEnhancement } from "./completionItemEnhancement";
import { configSync } from "./configSync";
import { databaseModel } from "./databaseModel";
import { enumAssertionFunctionsGeneration } from "./enumAssertionFunctionsGeneration";
import { enumsDeclarationSort } from "./enumsDeclarationSort";
import { folderEnhancement } from "./folderEnhancement";
import { functionEnhancement } from "./functionEnhancement";
import { gitEnhancement } from "./gitEnhancement";
import { keyCryptoTools } from "./keyCryptoTools";
import { markdownEnhancement } from "./markdownEnhancement";
import { nodeBuiltinModulesImportsUpdate } from "./nodeBuiltinModulesImportsUpdate";
import { projectEnhancement } from "./projectEnhancement";
import { readmeDocumentPreview } from "./readmeDocumentPreview";
import { runbookInfoGeneration } from "./runbookInfoGeneration";
import { runEnhancement } from "./runEnhancement";
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
    changelogSync,
    readmeDocumentPreview,
    functionEnhancement,
    nodeBuiltinModulesImportsUpdate,
    enumsDeclarationSort,
    enumAssertionFunctionsGeneration,
    typeOfZodSchemaGeneration,
    databaseModel,
    keyCryptoTools,
    folderEnhancement,
    runEnhancement,
    gitEnhancement,
    apiResourcesGeneration,
    statusBarEnhancement,
    styleCheck,
    completionItemEnhancement,
    projectEnhancement,
    configSync,
    apiRequestAssistant,
    runbookInfoGeneration,
]);
