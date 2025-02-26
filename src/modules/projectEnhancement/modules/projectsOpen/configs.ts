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

export enum EProjectDisplayStyle {
    Groups = "groups",
    Flat = "flat",
}

/**
 * Whether to open projects in flat style.
 */
export let projectDisplayStyle: EProjectDisplayStyle;

export function parseConfigs() {
    projectsOpenGroups = z
        .array(groupSchema)
        .default([])
        .parse(getConfigurationItem(`${extensionName}.projectsOpen.groups`));

    projectDisplayStyle = z
        .nativeEnum(EProjectDisplayStyle)
        .default(EProjectDisplayStyle.Groups)
        .parse(getConfigurationItem(`${extensionName}.projectsOpen.style`));
}
