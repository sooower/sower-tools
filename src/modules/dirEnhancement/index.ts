import { defineModule } from "@/core/moduleManager";

import { openFiles } from "./modules/openFiles";

export const dirEnhancement = defineModule([openFiles]);
