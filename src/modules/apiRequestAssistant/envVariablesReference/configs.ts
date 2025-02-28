import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableEnvDocumentReference: boolean;
export let envVariablesDirRelativePath: string;
export let supportedProjectNames: string[];
export let ignoreProjectNames: string[];

export function parseConfigs() {
    enableEnvDocumentReference = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.envVariablesReference.enable`
            )
        );
    envVariablesDirRelativePath = z
        .string()
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.envVariablesReference.envVariablesDirRelativePath`
            )
        );
    supportedProjectNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.envVariablesReference.supportedProjectNames`
            )
        );
    ignoreProjectNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.envVariablesReference.ignoreProjectNames`
            )
        );
}
