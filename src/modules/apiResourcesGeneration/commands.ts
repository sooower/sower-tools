import path from "node:path";

import pluralize from "pluralize";

import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";

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
            templatePath: "templates/api/src.api.index.ts.tpl",
            outputFilePath: "index.ts",
        },
        {
            templatePath: "templates/api/src.api.list.ts.tpl",
            outputFilePath: `${pluralize.singular(apiName)}ListGet.ts`,
        },
        {
            templatePath: "templates/api/src.api.create.ts.tpl",
            outputFilePath: `${pluralize.singular(apiName)}Create.ts`,
        },
        {
            templatePath: "templates/api/@id/src.api.index.ts.tpl",
            outputFilePath: `@id/index.ts`,
        },
        {
            templatePath: "templates/api/@id/src.api.get.ts.tpl",
            outputFilePath: `@id/${pluralize.singular(apiName)}Get.ts`,
        },
        {
            templatePath: "templates/api/@id/src.api.update.ts.tpl",
            outputFilePath: `@id/${pluralize.singular(apiName)}Update.ts`,
        },
        {
            templatePath: "templates/api/@id/src.api.delete.ts.tpl",
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

        const fileContent = fs
            .readFileSync(
                path.join(extensionCtx.extensionPath, templatePath),
                "utf-8"
            )
            .replace(/{{apiName}}/g, pluralize.singular(apiName))
            .replace(
                /{{apiNameCapital}}/g,
                pluralize.singular(toUpperCamelCase(apiName))
            )
            .replace(
                /{{apiNameCapitalPluralize}}/g,
                pluralize.plural(toUpperCamelCase(apiName))
            );

        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(absFilePath),
            Buffer.from(fileContent)
        );

        const workspaceFolderPath = getWorkspaceFolderPath();
        if (workspaceFolderPath === undefined) {
            return;
        }

        const relativeFilePath = path.relative(
            workspaceFolderPath,
            absFilePath
        );
        generatedFiles.push(relativeFilePath);
    };
}
