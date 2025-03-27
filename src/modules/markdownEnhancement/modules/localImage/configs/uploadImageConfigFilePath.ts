import path from "node:path";

import z from "zod";

import { extensionName, fs, getConfigurationItem, logger } from "@/core";
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
        fs.mkdirSync(path.dirname(configFilePath), { recursive: true });
        fs.writeFileSync(
            configFilePath,
            JSON.stringify(
                {
                    endpoint: "replace-with-your-minio-endpoint",
                    accessKey: "replace-with-your-minio-access-key",
                    secretKey: "replace-with-your-minio-secret-key",
                    bucketName: "replace-with-your-minio-bucket-name",
                    useSSL: false,
                },
                null,
                2
            )
        );
        logger.info(
            `Upload markdown image config file "${configFilePath}" does not exist. Created a empty one, please fill it with your own config and restart the extension before using it.`
        );

        return;
    }

    const { error, data } = uploadImageConfigSchema.safeParse(
        readJsonFile(configFilePath)
    );
    if (error !== undefined) {
        logger.error(
            `Config in upload markdown image config file "${configFilePath}" is invalid.`,
            error.message
        );

        return;
    }

    uploadImageConfig = data;
}
