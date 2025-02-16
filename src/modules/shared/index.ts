import { defineModule } from "@/shared/moduleManager";

import { configuration } from "./modules/configuration";

export const shared = defineModule([configuration]);
