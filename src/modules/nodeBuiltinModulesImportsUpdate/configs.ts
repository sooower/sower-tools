import z from "zod";

import { getConfigurationItem } from "@/core/configuration";
import { extensionName } from "@/core/context";

export let nodeBuiltinModules: string[];
export let enableUpdateNodeBuiltinModulesImports: boolean;

export function parseConfigs() {
    nodeBuiltinModules = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.nodeBuiltinModulesImportsUpdate.nodeBuiltinModules`
            )
        );
    enableUpdateNodeBuiltinModulesImports = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.nodeBuiltinModulesImportsUpdate.enable`
            )
        );
}
