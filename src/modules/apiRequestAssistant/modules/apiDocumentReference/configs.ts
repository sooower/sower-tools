import z from "zod";

import { extensionName, getConfigurationItem } from "@/core";

export let enableApiDocumentReference: boolean;
export let apiDirRelativePath: string;
export let supportedProjectNames: string[];
export let ignoreProjectNames: string[];

export function parseConfigs() {
    enableApiDocumentReference = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.apiDocumentReference.enable`
            )
        );
    apiDirRelativePath = z
        .string()
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.apiDocumentReference.apiDirRelativePath`
            )
        );
    supportedProjectNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.apiDocumentReference.supportedProjectNames`
            )
        );
    ignoreProjectNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.apiRequestAssistant.apiDocumentReference.ignoreProjectNames`
            )
        );
}
