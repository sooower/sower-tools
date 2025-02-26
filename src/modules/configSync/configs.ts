import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

const profileSchema = z.object({
    profileDirPath: z.string(),
    dest: z.object({
        projectRootDirPath: z.string(),
        dirPath: z.string(),
    }),
});

export let profile: z.infer<typeof profileSchema>;

export function parseConfigs() {
    profile = profileSchema.parse(
        getConfigurationItem(`${extensionName}.configSync.cursor.profile`)
    );
}
