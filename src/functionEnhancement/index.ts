import { subscribeRefactorFuncParamsToUseObjectParam } from "./refactorFuncParamsToUseObjectParam";
import { subscribeValidateFuncParameterTypeName } from "./validateFuncParameterTypeName";

export async function subscribeEnhanceFunction() {
    subscribeValidateFuncParameterTypeName();
    subscribeRefactorFuncParamsToUseObjectParam();
}
