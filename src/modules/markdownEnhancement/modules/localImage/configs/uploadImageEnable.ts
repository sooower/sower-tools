import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableUploadImage: boolean;

export function parseUploadImageEnable() {
    enableUploadImage = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.markdownEnhancement.localImage.enableUploadImage`
            )
        );
}
