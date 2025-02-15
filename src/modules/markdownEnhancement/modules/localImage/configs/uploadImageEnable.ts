import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

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
