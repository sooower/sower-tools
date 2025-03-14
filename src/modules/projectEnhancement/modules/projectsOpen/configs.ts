import { writeFileSync } from "node:fs";

import { z } from "zod";

import { extensionName, fs, getConfigurationItem, logger } from "@/core";
import { parseHomeDirAlias } from "@/utils/common";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { readJsonFile } from "@utils/fs";

const groupSchema = z.object({
    name: z.string(),
    projects: z.array(
        z.object({
            name: z.string().optional(),
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

export let openedProjectsFilePath: string;

export function parseConfigs() {
    projectsOpenGroups = z
        .array(groupSchema)
        .default([])
        .parse(getConfigurationItem(`${extensionName}.projectsOpen.groups`));

    projectDisplayStyle = z
        .nativeEnum(EProjectDisplayStyle)
        .default(EProjectDisplayStyle.Groups)
        .parse(getConfigurationItem(`${extensionName}.projectsOpen.style`));

    openedProjectsFilePath = parseHomeDirAlias(
        z
            .string()
            .parse(
                getConfigurationItem(
                    `${extensionName}.projectsOpen.openedProjectsFilePath`
                )
            )
    );
}

/**
 * Get the opened projects by reading from the config file.
 * @returns The opened projects.
 */
export function getOpenedProjects() {
    if (!fs.existsSync(openedProjectsFilePath)) {
        return [];
    }

    return z
        .array(
            z.object({
                fsPath: z.string(),
                pid: z.number(),
            })
        )
        .default([])
        .parse(readJsonFile(openedProjectsFilePath));
}

/**
 * Append the workspace folder to the opened projects.
 */
export function appendWorkspaceToOpenedProject() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const openedProjects = getOpenedProjects();
    openedProjects.push({
        fsPath: workspaceFolderPath,
        pid: process.pid,
    });
    writeFileSync(
        openedProjectsFilePath,
        JSON.stringify(openedProjects, null, 2)
    );
    logger.trace(
        `Appended workspace "${workspaceFolderPath}" to opened projects.`
    );
}

/**
 * Remove the workspace folder from the opened projects.
 */
export function removeWorkspaceFromOpenedProject() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const openedProjects = getOpenedProjects().filter(
        project => project.fsPath !== workspaceFolderPath
    );
    writeFileSync(
        openedProjectsFilePath,
        JSON.stringify(openedProjects, null, 2)
    );
    logger.trace(
        `Removed workspace "${workspaceFolderPath}" from opened projects.`
    );
}
