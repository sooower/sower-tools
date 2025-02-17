import path from "node:path";

import z from "zod";

import { fs, os } from "@/core";
import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";
import { readJsonFile } from "@utils/fs";

const uploadImageConfigSchema = z.object({
    endpoint: z.string(),
    accessKey: z.string(),
    secretKey: z.string(),
    bucketName: z.string(),
    useSSL: z.boolean(),
});

export let uploadImageConfig: z.infer<typeof uploadImageConfigSchema>;

export function parseUploadImageConfigFilePath() {
    const configFilePath = path.resolve(
        z
            .string()
            .parse(
                getConfigurationItem(
                    `${extensionName}.markdownEnhancement.localImage.uploadImageConfigFilePath`
                )
            )
            .replace(/^~/, os.homedir())
    );

    if (!fs.existsSync(configFilePath)) {
        throw new Error(`config file "${configFilePath}" does not exist.`);
    }

    const { error, data } = uploadImageConfigSchema.safeParse(
        readJsonFile(configFilePath)
    );
    if (error !== undefined) {
        throw new Error(
            `config in file "${configFilePath}" is invalid. ${error.message}`
        );
    }

    uploadImageConfig = data;
}
