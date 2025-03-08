import path from "node:path";

import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";
import { parseHomeDirAlias } from "@/utils/common";
import { CommonUtils } from "@utils/common";

const projectSchema = z.object({
    projectPath: z.string(),
    serviceName: z.string(),
    envPrefix: z.string(),
});

export let enableGenerateRunbookInfo: boolean;
export let projects: z.infer<typeof projectSchema>[];
export let runbookDirPath: string;
export let migrationDirNames: string[];
export let envRelativeFilePaths: string[];

export function parseConfigs() {
    enableGenerateRunbookInfo = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.runbookInfoGeneration.enable`
            )
        );
    projects = z
        .array(projectSchema)
        .parse(
            getConfigurationItem(
                `${extensionName}.runbookInfoGeneration.projects`
            )
        );
    mapProjectPathToAbsolutePathsIfNeeded();
    runbookDirPath = parseHomeDirAlias(
        z
            .string()
            .parse(
                getConfigurationItem(
                    `${extensionName}.runbookInfoGeneration.runbookDirPath`
                )
            )
    );
    migrationDirNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.runbookInfoGeneration.migrationDirNames`
            )
        );
    envRelativeFilePaths = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.runbookInfoGeneration.envRelativeFilePaths`
            )
        );
}

function mapProjectPathToAbsolutePathsIfNeeded() {
    let projectBasePath = z
        .string()
        .optional()
        .parse(
            getConfigurationItem(
                `${extensionName}.runbookInfoGeneration.projectBasePath`
            )
        );
    if (projectBasePath !== undefined) {
        projectBasePath = parseHomeDirAlias(projectBasePath);
    }
    if (projectBasePath !== undefined && path.isAbsolute(projectBasePath)) {
        projects = projects.map(it => {
            const parsedProjectPath = parseHomeDirAlias(it.projectPath);
            if (path.isAbsolute(parsedProjectPath)) {
                return it;
            }

            return {
                ...it,
                projectPath: path.resolve(
                    CommonUtils.mandatory(projectBasePath),
                    parsedProjectPath
                ),
            };
        });
    }
}
