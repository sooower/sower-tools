import path from "node:path";

import z from "zod";

import { fs } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";
import { readFile } from "@utils/fs";
import { Json } from "@utils/json";

export function getDebuggingConfigurations() {
    try {
        const workspaceFolderPath = getWorkspaceFolderPath();
        if (workspaceFolderPath === undefined) {
            return;
        }

        const launchConfigFilePath = "./.vscode/launch.json";
        const launchConfigFileAbsPath = path.resolve(
            workspaceFolderPath,
            launchConfigFilePath
        );
        CommonUtils.assert(
            fs.existsSync(launchConfigFileAbsPath),
            `Launch file "${launchConfigFilePath}" is not exists.`
        );

        const { configurations } = z
            .object({
                configurations: z.array(
                    z
                        .object({
                            name: z.string(),
                            type: z.string(),
                            request: z.string(),
                        })
                        .passthrough()
                ),
            })
            .parse(Json.parse({ str: readFile(launchConfigFileAbsPath) }));

        return configurations;
    } catch (e) {
        throw new Error(`Failed to get debugging configurations. ${e}`);
    }
}
