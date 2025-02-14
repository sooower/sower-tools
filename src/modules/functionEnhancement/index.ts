import { convertParametersToObjectOptions } from "./modules/convertParametersToObjectOptions";
import { syncFunctionParameterTypeName } from "./modules/syncFunctionParameterTypeName";
import { syncTypeMembers } from "./modules/syncTypeMembers";

export const functionEnhancement = {
    convertParametersToObjectOptions,
    syncTypeMembers,
    syncFunctionParameterTypeName,
};
