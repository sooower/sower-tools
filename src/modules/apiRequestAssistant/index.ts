import { defineModule } from "@/core";

import { envVariablesReference } from "./modules/envVariablesReference";

export const apiRequestAssistant = defineModule([envVariablesReference]);
