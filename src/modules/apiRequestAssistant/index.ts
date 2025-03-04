import { defineModule } from "@/core";

import { apiDocumentReference } from "./modules/apiDocumentReference";
import { envVariablesReference } from "./modules/envVariablesReference";

export const apiRequestAssistant = defineModule([
    envVariablesReference,
    apiDocumentReference,
]);
