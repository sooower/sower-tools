import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableOverwriteFile: boolean;
export let ignoredInsertionColumns: string[];
export let ignoredUpdatingColumns: string[];

export function parseConfigs() {
    enableOverwriteFile = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.enableOverwriteFile`
            )
        );

    ignoredInsertionColumns = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.ignoredInsertionColumns`
            )
        );

    ignoredUpdatingColumns = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.ignoredUpdatingColumns`
            )
        );
}
