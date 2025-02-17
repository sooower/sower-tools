import { nextTick } from "node:process";

import * as prettier from "prettier";

import { fs } from "@/core";
import { CommonUtils } from "@utils/common";

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

export function reIndent(str: string, indentNum = 0) {
    const lines = str.split("\n");

    let minIndent = Infinity;
    for (const line of str.split("\n")) {
        if (line.trim() === "") {
            continue;
        }

        // Gets the index of the first non-whitespace character
        const indent = line.search(/\S/);
        if (indent < minIndent) {
            minIndent = indent;
        }
    }

    return lines
        .map(line => {
            return " ".repeat(indentNum) + line.slice(minIndent);
        })
        .join("\n");
}

export async function prettierFormatFile(filePath: string) {
    return await new Promise((resolve: (text: string) => void) => {
        nextTick(async () => {
            const originalData = await fs.promises.readFile(filePath, {
                encoding: "utf8",
            });

            resolve(
                prettier.format(originalData, {
                    parser: "typescript",
                    tabWidth: 4,
                })
            );
        });
    });
}

export function prettierFormatText(text: string) {
    return prettier.format(text, {
        parser: "typescript",
        tabWidth: 4,
    });
}
