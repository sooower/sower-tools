import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";
import { CommonUtils } from "@utils/common";

/**
 * Words mapping with format: `<originalWord>:<mappedWord>`, for example: "Id:ID".
 * It will be used to map words when to uppercase.
 */
export let uppercaseWordsMapping: Map<string, string>;

export function parseConfigs() {
    uppercaseWordsMapping = new Map(
        z
            .array(
                z.string().transform(it => {
                    const [originalWord, mappedWord] = it.split(":");
                    CommonUtils.assert(
                        originalWord !== undefined && mappedWord !== undefined,
                        `Invalid uppercase words mapping: ${it}, formatting should be "<originalWord>:<mappedWord>".`
                    );

                    return [originalWord, mappedWord] satisfies [
                        string,
                        string
                    ];
                })
            )
            .parse(
                getConfigurationItem(`${extensionName}.uppercaseWordsMapping`)
            )
    );
}
