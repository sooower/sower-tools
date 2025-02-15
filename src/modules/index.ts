import { moduleManager } from "@/shared/module";

import { countdownTimer } from "./countdownTimer";
import { functionEnhancement } from "./functionEnhancement";
import { generateEnumAssertionFunctions } from "./generateEnumAssertionFunctions";
import { generateTypeOfZodSchema } from "./generateTypeOfZodSchema";
import { loadConfiguration } from "./loadConfiguration";
import { markdown } from "./markdown";
import { previewReadmeDocument } from "./previewReadmeDocument";
import { showSelectedLines } from "./showSelectedLines";
import { showStatusBarNowTimestamp } from "./showStatusBarNowTimestamp";
import { sortEnums } from "./sortEnums";
import { stringTools } from "./stringTools";
import { syncChangelog } from "./syncChangelog";
import { timestampTools } from "./timestampTools";
import { updateNodeBuiltinModulesImports } from "./updateNodeBuiltinModulesImports";

/**
 * Register all sub modules.
 */
export function registerModules() {
    moduleManager.registerModule(loadConfiguration);
    moduleManager.registerModule(markdown);
    moduleManager.registerModule(countdownTimer);
    moduleManager.registerModule(timestampTools);
    moduleManager.registerModule(stringTools);
    moduleManager.registerModule(syncChangelog);
    moduleManager.registerModule(showStatusBarNowTimestamp);
    moduleManager.registerModule(previewReadmeDocument);
    moduleManager.registerModule(showSelectedLines);
    moduleManager.registerModule(
        functionEnhancement.convertParametersToObjectOptions
    );
    moduleManager.registerModule(functionEnhancement.syncTypeMembers);
    moduleManager.registerModule(
        functionEnhancement.syncFunctionParameterTypeName
    );
    moduleManager.registerModule(updateNodeBuiltinModulesImports);
    moduleManager.registerModule(sortEnums);
    moduleManager.registerModule(generateEnumAssertionFunctions);
    moduleManager.registerModule(generateTypeOfZodSchema);
}
