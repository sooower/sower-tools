import { specialWordsMap } from "../init";

export function toLowerCamelCase(input: string) {
    const camelCaseInput = input.replace(/[-_.](.)/g, (_, c) =>
        c.toUpperCase()
    );
    let res =
        camelCaseInput.slice(0, 1).toLowerCase() + camelCaseInput.slice(1);
    for (const [k, v] of specialWordsMap) {
        res = res.replaceAll(k, v);
    }

    return res;
}

export function toUpperCamelCase(input: string) {
    let camelCaseInput = toLowerCamelCase(input);
    let res =
        camelCaseInput.slice(0, 1).toUpperCase() + camelCaseInput.slice(1);
    for (const [k, v] of specialWordsMap) {
        res = res.replaceAll(k, v);
    }

    return res;
}
