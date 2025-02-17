import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

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
