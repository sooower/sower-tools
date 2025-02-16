import { defineModule } from "@/shared/moduleManager";

import { openFiles } from "./modules/openFiles";

export const dirEnhancement = defineModule([openFiles]);
