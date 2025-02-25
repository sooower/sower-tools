import { defineModule } from "@/core";

import { parametersObjectOptionsConversion } from "./modules/parametersObjectOptionsConversion";
import { parameterTypeMembersSync } from "./modules/parameterTypeMembersSync";
import { parameterTypeNameSync } from "./modules/parameterTypeNameSync";

export const functionEnhancement = defineModule([
    parametersObjectOptionsConversion,
    parameterTypeMembersSync,
    parameterTypeNameSync,
]);
