import { defineModule } from "@/core";

import { configuration } from "./modules/configuration";

export const shared = defineModule([configuration]);
