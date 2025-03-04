import { CommonUtils } from "@utils/common";

import { uppercaseWordsMapping } from "./configs";

export function toLowerCamelCase(input: string) {
    // Restore special words
    for (const [k, v] of uppercaseWordsMapping) {
        input = input.replaceAll(v, k);
    }
    const camelCaseInput = input.replace(/[-_.](.)/g, (_, c) =>
        c.toUpperCase()
    );

    return camelCaseInput.slice(0, 1).toLowerCase() + camelCaseInput.slice(1);
}

export function toUpperCamelCase(input: string) {
    let camelCaseInput = toLowerCamelCase(input);
    let res =
        camelCaseInput.slice(0, 1).toUpperCase() + camelCaseInput.slice(1);

    // Map uppercase words
    if (uppercaseWordsMapping.has(res)) {
        res = CommonUtils.mandatory(uppercaseWordsMapping.get(res));
    }

    return res;
}
