import { defineModule } from "@/core/moduleManager";

import { configuration } from "./modules/configuration";

export const shared = defineModule([configuration]);
