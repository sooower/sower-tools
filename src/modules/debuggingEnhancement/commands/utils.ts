import path from "node:path";

import z from "zod";

import { fs } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";
import { readFile } from "@utils/fs";
import { Json } from "@utils/json";

export function getDebuggingConfigurations() {
    try {
        const launchConfigFilePath = "./.vscode/launch.json";
        const launchConfigFileAbsPath = path.resolve(
            getWorkspaceFolderPath(),
            launchConfigFilePath
        );
        CommonUtils.assert(
            fs.existsSync(launchConfigFileAbsPath),
            `Launch file "${launchConfigFilePath}" is not exists.`
        );

        const { configurations } = z
            .object({
                configurations: z.array(
                    z.object({
                        type: z.string(),
                        name: z.string(),
                        request: z.string(),
                    })
                ),
            })
            .parse(Json.parse({ str: readFile(launchConfigFileAbsPath) }));

        return configurations;
    } catch (e) {
        throw new Error(`Error when getting debugging configurations. ${e}`);
    }
}
