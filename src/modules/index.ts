import { moduleManager } from "@/shared/module";

import { countdownTimer } from "./countdownTimer";
import { loadConfiguration } from "./loadConfiguration";
import { markdown } from "./markdown";
import { showStatusBarNowTimestamp } from "./showStatusBarNowTimestamp";
import { stringTools } from "./stringTools";
import { syncChangelog } from "./syncChangelog";
import { timestampTools } from "./timestampTools";

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
}
