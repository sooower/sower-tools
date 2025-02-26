import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

/**
 * Whether to enable sync cursor files, including .
 */
export let enableSyncCursorFiles: boolean;

const profileSchema = z.object({
    profileDirPath: z.string(),
    storage: z.object({
        projectRootDirPath: z.string(),
        dirName: z.string(),
    }),
});

export let profile: z.infer<typeof profileSchema>;

export function parseConfigs() {
    enableSyncCursorFiles = z
        .boolean()
        .parse(
            getConfigurationItem(`${extensionName}.configSync.cursor.enable`)
        );
    if (!enableSyncCursorFiles) {
        return;
    }

    profile = profileSchema.parse(
        getConfigurationItem(`${extensionName}.configSync.cursor.profile`)
    );
}
