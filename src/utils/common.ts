import crypto from "node:crypto";
import path from "node:path";
import { nextTick } from "node:process";

import ignore from "ignore";
import * as prettier from "prettier";

import { fs, logger, os } from "@/core";
import { execCommand } from "@utils/command";
import { CommonUtils } from "@utils/common";

/**
 * Convert the name of an enum type to a string without the prefix "E".
 *
 * @param enumTypeName - The name of the enum type.
 * @returns The name of the enum type without the prefix "E".
 */
export function mapEnumNameWithoutPrefix(enumTypeName: string) {
    CommonUtils.assert(
        enumTypeName.length >= 2,
        `Name of enumType is too short.`
    );

    return enumTypeName[0] === "E" && /[A-Z]/.test(enumTypeName[1])
        ? enumTypeName.slice(1)
        : enumTypeName;
}

/**
 * Reverse a map.
 *
 * @param map - The map to reverse.
 * @returns A new map with the keys and values reversed.
 */
export function reverseMap(map: Map<string, string>) {
    const newMap = new Map<string, string>();
    for (const [k, v] of map) {
        map.set(v, k);
    }

    return newMap;
}

/**
 * Re-indent a string (single-line or multi-line) with the given number of
 * spaces and maintain the original indentation of the first non-whitespace character.
 *
 * @param str - The string to re-indent.
 * @param indentNum - The number of spaces to indent.
 * @returns The re-indented string.
 */
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

/**
 * Use 'prettier' to prettify the content of a file, use 'typescript' parser.
 *
 * @param filePath - The path of the file to prettify.
 * @param tabWidth - The width of the tab character, default is 4.
 * @returns The prettified content of the file.
 */
export async function prettierFormatFile(filePath: string, tabWidth = 4) {
    return await new Promise((resolve: (text: string) => void) => {
        nextTick(async () => {
            const fileContent = await fs.promises.readFile(filePath, {
                encoding: "utf8",
            });
            resolve(prettierFormatText(fileContent, tabWidth));
        });
    });
}

/**
 * Use 'prettier' to prettify the content of a string, use 'typescript' parser.
 *
 * @param text - The string to prettify.
 * @param tabWidth - The width of the tab character, default is 4.
 * @returns The prettified string.
 */
export function prettierFormatText(text: string, tabWidth = 4) {
    return prettier.format(text, {
        parser: "typescript",
        tabWidth,
    });
}

/**
 * Copy a directory recursively.
 *
 * @param srcPath - The source path.
 * @param destPath - The destination path.
 * @param ignorePatterns - The patterns to ignore, relative to the source path, supports 'glob' patterns.
 */
export async function copyDirRecursive(
    srcPath: string,
    destPath: string,
    { ignorePatterns = [] }: { ignorePatterns?: string[] }
) {
    const ig = ignore().add(ignorePatterns);

    const processEntry = async (currSrcPath: string, currDestPath: string) => {
        const relPath = path.relative(srcPath, currSrcPath);
        if (relPath !== "" && ig.ignores(relPath)) {
            return;
        }

        const stat = await fs.promises.stat(currSrcPath);
        if (stat.isDirectory()) {
            await fs.promises.mkdir(currDestPath, { recursive: true });
            const items = await fs.promises.readdir(currSrcPath);
            for (const item of items) {
                await processEntry(
                    path.join(currSrcPath, item),
                    path.join(currDestPath, item)
                );
            }
        } else {
            await fs.promises.copyFile(currSrcPath, currDestPath);
        }
    };

    await fs.promises.mkdir(destPath, { recursive: true });
    await processEntry(srcPath, destPath);
}

/**
 * Calculate the MD5 hash of the file content.
 *
 * @param filePath - The path of the file to calculate the MD5 hash.
 * @returns The MD5 hash of the file content, or `undefined` if the file does not exist.
 */
export async function calcFileContentMd5(filePath: string) {
    if (!fs.existsSync(filePath)) {
        return;
    }

    const content = await fs.promises.readFile(filePath, "utf-8");

    return crypto.createHash("md5").update(content).digest("hex");
}

/**
 * Trim if necessary and parse the home directory alias in the file path.
 *
 * @param filePath - The file path to parse.
 * @returns The parsed file path.
 */
export function parseHomeDirAlias(filePath: string) {
    const filePathTrimmed = filePath.trim();
    if (filePathTrimmed.startsWith("~")) {
        return path.resolve(os.homedir(), filePathTrimmed.slice(2));
    }

    return filePathTrimmed;
}

/**
 * Debounce a function, delaying the execution of the function until the delay time has passed.
 *
 * @param fn - The function to debounce.
 * @param delay - The delay time in milliseconds.
 * @param immediate - If `true`, the function will be executed immediately
 * if it is called during the delay time, default is `false`.
 * @returns The debounced function.
 */
export function debounce<F extends (...args: any[]) => any>(
    fn: F,
    delay: number,
    options?: { immediate?: boolean }
) {
    const { immediate = false } = options ?? {};

    let timeoutId: NodeJS.Timeout | null = null;

    return async function (
        this: ThisParameterType<F>,
        ...args: Parameters<F>
    ): Promise<ReturnType<F> | undefined> {
        const context = this;

        let result: ReturnType<F> | undefined;

        const laterExecFn = async () => {
            timeoutId = null;
            if (!immediate) {
                result = await fn.apply(context, args);
            }
        };

        if (immediate && timeoutId === null) {
            result = await fn.apply(context, args);
        }

        timeoutId !== null && clearTimeout(timeoutId);
        timeoutId = setTimeout(laterExecFn, delay);

        return result;
    };
}

type TExecCmdOptions = {
    /**
     * The command to execute.
     */
    command: string | [string, ...string[]];

    /**
     * The working directory of the command.
     */
    cwd: string;

    /**
     * Whether to interact with the command, if `false`, the command will return
     * the output of the command to the caller.
     */
    interactive: boolean;
};

/**
 * Execute a command, redirect the command output to the logger, if the parameter
 * `interactive` is `false`, the command output will not be redirected to the logger.
 *
 * @param options - The options of the command, see {@link TExecCmdOptions}.
 * @returns The output of the command.
 */
export async function execCmd({ command, cwd, interactive }: TExecCmdOptions) {
    return await execCommand({
        command,
        cwd,
        interactive,
        redirectHandle: {
            onData: data => {
                logger.trace(data);
            },
            onError: e => {
                logger.trace(e.message);
            },
        },
    });
}
