import { subscribeConvertParametersToOptionsObject } from "./convertParametersToOptionsObject";
import { subscribeUpdateTypeMemberNames } from "./updateTypeMemberNames";

export function subscribeEnhanceFunction() {
    subscribeConvertParametersToOptionsObject();
    subscribeUpdateTypeMemberNames();
}
