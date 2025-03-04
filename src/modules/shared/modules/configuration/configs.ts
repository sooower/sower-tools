import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";
import { CommonUtils } from "@utils/common";

export let uppercaseWordsMapping: Map<string, string>;
export let enableShowAddedASTProjectSourceFiles: boolean;
export let refreshSourceFileCacheDelay: number;

export function parseConfigs() {
    uppercaseWordsMapping = new Map(
        z
            .array(
                z.string().transform(it => {
                    const [originalWord, mappedWord] = it.split(":");

                    CommonUtils.assert(
                        originalWord !== "" && mappedWord !== "",
                        `Invalid uppercase words mapping: "${it}", formatting should be "<originalWord>:<mappedWord>".`
                    );

                    return [originalWord, mappedWord] satisfies [
                        string,
                        string
                    ];
                })
            )
            .parse(
                getConfigurationItem(
                    `${extensionName}.shared.uppercaseWordsMapping`
                )
            )
    );
    enableShowAddedASTProjectSourceFiles = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.shared.enableShowAddedASTProjectSourceFiles`
            )
        );
    refreshSourceFileCacheDelay = z
        .number()
        .min(0)
        .parse(
            getConfigurationItem(
                `${extensionName}.shared.refreshSourceFileCacheDelay`
            )
        );
}
