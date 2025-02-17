import { defineModule } from "@/core/moduleManager";

import { logPrinting } from "./modules/logPrinting";

export const completionItemEnhancement = defineModule([logPrinting]);
