import z from "zod";

import { getConfigurationItem } from "@/shared/configuration";
import { extensionName } from "@/shared/context";

export let enableMarkdownImageUpload: boolean;

export function parseMarkdownImageUploadEnable() {
    enableMarkdownImageUpload = z
        .boolean()
        .parse(
            getConfigurationItem(`${extensionName}.markdownImageUpload.enable`)
        );
}
