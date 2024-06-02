import { subscribeRefactorFuncParameterTypeName } from "./refactorFuncParameterTypeName";
import { subscribeRefactorFuncParametersToUseObjectParameter } from "./refactorFuncParamsToUseObjectParam";

export async function subscribeEnhanceFunction() {
    subscribeRefactorFuncParameterTypeName();
    subscribeRefactorFuncParametersToUseObjectParameter();
}
