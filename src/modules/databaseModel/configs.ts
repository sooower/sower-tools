import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export const projectIgnoredColumnSchema = z.object({
    project: z.string(),
    columns: z.array(
        z.object({
            schema: z.string(),
            table: z.string(),
            columns: z.array(z.string()),
        })
    ),
});

export let enableOverwriteFile: boolean;

export let globalIgnoredInsertionColumns: string[];
export let projectIgnoredInsertionColumns: z.infer<
    typeof projectIgnoredColumnSchema
>[];

export let globalIgnoredUpdateColumns: string[];
export let projectIgnoredUpdateColumns: z.infer<
    typeof projectIgnoredColumnSchema
>[];

export function parseConfigs() {
    enableOverwriteFile = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.enableOverwriteFile`
            )
        );
    globalIgnoredInsertionColumns = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.globalIgnoredInsertionColumns`
            )
        );
    projectIgnoredInsertionColumns = z
        .array(projectIgnoredColumnSchema)
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.projectIgnoredInsertionColumns`
            )
        );
    globalIgnoredUpdateColumns = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.globalIgnoredUpdateColumns`
            )
        );
    projectIgnoredUpdateColumns = z
        .array(projectIgnoredColumnSchema)
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.projectIgnoredUpdateColumns`
            )
        );
}
