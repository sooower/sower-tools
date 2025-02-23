import { defineModule } from "@/core";

import { openFiles } from "./modules/openFiles";

export const dirEnhancement = defineModule([openFiles]);
