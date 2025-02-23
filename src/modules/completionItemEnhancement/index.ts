import { defineModule } from "@/core";

import { logPrinting } from "./modules/logPrinting";

export const completionItemEnhancement = defineModule([logPrinting]);
