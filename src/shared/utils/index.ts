import { specialWordsMap } from "../init";
import CommonUtils from "./commonUtils";

export function toLowerCamelCase(input: string) {
    // Restore special words
    for (const [k, v] of specialWordsMap) {
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

    // Replace special words
    if (specialWordsMap.has(res)) {
        res = CommonUtils.mandatory(specialWordsMap.get(res));
    }

    return res;
}

export function mapEnumNameWithoutPrefix(enumTypeName: string) {
    CommonUtils.assert(
        enumTypeName.length >= 2,
        `Name of enumType is too short.`
    );

    return enumTypeName[0] === "E" && /[A-Z]/.test(enumTypeName[1])
        ? enumTypeName.slice(1)
        : enumTypeName;
}

export function reverseMap(map: Map<string, string>) {
    const newMap = new Map<string, string>();
    for (const [k, v] of map) {
        map.set(v, k);
    }

    return newMap;
}
