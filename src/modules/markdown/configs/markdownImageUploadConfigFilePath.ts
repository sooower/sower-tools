import path from "node:path";

import z from "zod";

import { fs, os } from "@/shared";
import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";
import { CommonUtils } from "@utils/common";
import { readJsonFile } from "@utils/fs";

const markdownImageUploadConfigSchema = z.object({
    endpoint: z.string(),
    accessKey: z.string(),
    secretKey: z.string(),
    bucketName: z.string(),
    useSSL: z.boolean(),
});

export let markdownImageUploadConfig: z.infer<
    typeof markdownImageUploadConfigSchema
>;

export function parseMarkdownImageUploadConfigFilePath() {
    const configFilePath = path.resolve(
        z
            .string()
            .parse(
                getConfigurationItem(
                    `${extensionName}.markdownImageUpload.configFilePath`
                )
            )
            .replace(/^~/, os.homedir())
    );

    CommonUtils.assert(
        fs.existsSync(configFilePath),
        `config file "${configFilePath}" does not exist.`
    );

    const { error, data } = markdownImageUploadConfigSchema.safeParse(
        readJsonFile(configFilePath)
    );
    if (error !== undefined) {
        throw new Error(
            `config in file "${configFilePath}" is invalid. ${error.message}`
        );
    }

    markdownImageUploadConfig = data;
}
