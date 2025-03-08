import path from "node:path";

import z from "zod";

import { extensionName, fs, getConfigurationItem } from "@/core";
import { parseHomeDirAlias } from "@/utils/common";
import { readJsonFile } from "@utils/fs";

import { enableUploadImage } from "./uploadImageEnable";

const uploadImageConfigSchema = z.object({
    endpoint: z.string(),
    accessKey: z.string(),
    secretKey: z.string(),
    bucketName: z.string(),
    useSSL: z.boolean(),
});

export let uploadImageConfig: z.infer<typeof uploadImageConfigSchema>;

export function parseUploadImageConfigFilePath() {
    if (!enableUploadImage) {
        return;
    }

    const configFilePath = path.resolve(
        parseHomeDirAlias(
            z
                .string()
                .parse(
                    getConfigurationItem(
                        `${extensionName}.markdownEnhancement.localImage.uploadImageConfigFilePath`
                    )
                )
        )
    );

    if (!fs.existsSync(configFilePath)) {
        throw new Error(
            `Upload markdown image config file "${configFilePath}" does not exist.`
        );
    }

    const { error, data } = uploadImageConfigSchema.safeParse(
        readJsonFile(configFilePath)
    );
    if (error !== undefined) {
        throw new Error(
            `Config in upload markdown image config file "${configFilePath}" is invalid. ${error.message}`
        );
    }

    uploadImageConfig = data;
}
