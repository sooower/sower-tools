import { z } from "zod";

import { extensionName, getConfigurationItem } from "@/core";

const groupSchema = z.object({
    name: z.string(),
    projects: z.array(
        z.object({
            name: z.string(),
            fsPath: z.string(),
        })
    ),
});

export type ProjectsOpenGroup = z.infer<typeof groupSchema>;

/**
 * The groups of projects.
 */
export let projectsOpenGroups: ProjectsOpenGroup[];

export function parseConfigs() {
    projectsOpenGroups = z
        .array(groupSchema)
        .default([]) // Default value is an empty array.
        .parse(getConfigurationItem(`${extensionName}.projectsOpen.groups`));
}

// FIXME: error when there no workspace folder opened
