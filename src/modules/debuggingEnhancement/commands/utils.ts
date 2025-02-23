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
                        name: z.string(),
                        type: z.string(),
                        request: z.string(),
                        args: z.array(z.string()).optional(),
                        runtimeArgs: z.array(z.string()).optional(),
                        cwd: z.string().optional(),
                        internalConsoleOptions: z.string().optional(),
                        skipFiles: z.array(z.string()).optional(),
                        env: z.record(z.string(), z.string()).optional(),
                        envFile: z.string().optional(),
                    })
                ),
            })
            .parse(Json.parse({ str: readFile(launchConfigFileAbsPath) }));

        return configurations;
    } catch (e) {
        throw new Error(`Failed to get debugging configurations. ${e}`);
    }
}
