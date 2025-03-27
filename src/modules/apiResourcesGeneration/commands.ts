import path from "node:path";

import pluralize from "pluralize";

import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import { renderTemplateFile } from "@/utils/template";
import {
    getPossibleWorkspaceRelativePath,
    getWorkspaceFolderPath,
} from "@/utils/vscode";

import { toUpperCamelCase } from "../shared/modules/configuration/utils";

export function registerCommandGenerateAPIResources() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.apiResourcesGeneration.generateAPIResources`,
            async (uri: vscode.Uri) => {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Generating API Resources",
                        cancellable: false,
                    },
                    async (progress, token) => {
                        try {
                            const input = await vscode.window.showInputBox({
                                prompt: "Input API Name please",
                                placeHolder: "API Name",
                            });
                            if (input === undefined) {
                                return;
                            }

                            const generatedAPIResources =
                                await generateAPIResources(
                                    path.join(uri.fsPath, input)
                                );
                            logger.info(
                                `Generated API Resources.\n`,
                                generatedAPIResources
                                    .map(it => `- ${it}`)
                                    .join("\n")
                            );

                            return;
                        } catch (e) {
                            logger.error(
                                "Failed to generate API resources.",
                                e
                            );
                        }
                    }
                );
            }
        )
    );
}

type TemplateData = {
    templatePath: string;
    outputFilePath: string;
};

async function generateAPIResources(dirPath: string) {
    const apiName = path.basename(dirPath);
    const fileTemplateData: TemplateData[] = [
        {
            templatePath:
                "templates/apiResourcesGeneration/api/src.api.index.ts.hbs",
            outputFilePath: "index.ts",
        },
        {
            templatePath:
                "templates/apiResourcesGeneration/api/src.api.list.ts.hbs",
            outputFilePath: `${pluralize.singular(apiName)}ListGet.ts`,
        },
        {
            templatePath:
                "templates/apiResourcesGeneration/api/src.api.create.ts.hbs",
            outputFilePath: `${pluralize.singular(apiName)}Create.ts`,
        },
        {
            templatePath:
                "templates/apiResourcesGeneration/api/@id/src.api.index.ts.hbs",
            outputFilePath: `@id/index.ts`,
        },
        {
            templatePath:
                "templates/apiResourcesGeneration/api/@id/src.api.get.ts.hbs",
            outputFilePath: `@id/${pluralize.singular(apiName)}Get.ts`,
        },
        {
            templatePath:
                "templates/apiResourcesGeneration/api/@id/src.api.update.ts.hbs",
            outputFilePath: `@id/${pluralize.singular(apiName)}Update.ts`,
        },
        {
            templatePath:
                "templates/apiResourcesGeneration/api/@id/src.api.delete.ts.hbs",
            outputFilePath: `@id/${pluralize.singular(apiName)}Delete.ts`,
        },
    ];

    const generatedFiles: string[] = [];

    const gen = generate({ apiName, dirPath, generatedFiles });
    for (const { outputFilePath, templatePath } of fileTemplateData) {
        await gen({
            outputFilePath,
            templatePath,
        });
    }

    return generatedFiles;
}

function generate({
    apiName,
    dirPath,
    generatedFiles,
}: {
    apiName: string;
    dirPath: string;
    generatedFiles: string[];
}) {
    return async ({ outputFilePath, templatePath }: TemplateData) => {
        const absFilePath = path.join(dirPath, outputFilePath);
        if (fs.existsSync(absFilePath)) {
            return;
        }

        await renderTemplateFile({
            templateFilePath: path.join(
                extensionCtx.extensionPath,
                templatePath
            ),
            outputFilePath: absFilePath,
            data: {
                apiName: pluralize.singular(apiName),
                apiNameCapital: pluralize.singular(toUpperCamelCase(apiName)),
                apiNameCapitalPluralize: pluralize.plural(
                    toUpperCamelCase(apiName)
                ),
            },
            formatText: true,
        });

        const workspaceFolderPath = getWorkspaceFolderPath();
        if (workspaceFolderPath === undefined) {
            return;
        }

        generatedFiles.push(getPossibleWorkspaceRelativePath(absFilePath));
    };
}
