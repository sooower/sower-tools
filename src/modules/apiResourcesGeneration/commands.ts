import path from "node:path";

import pluralize from "pluralize";

import { format, fs, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";

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
                            vscode.window.showInformationMessage(
                                format(
                                    `Generated API Resources:\n%s`,
                                    generatedAPIResources
                                        .map(it => `'${it}'`)
                                        .join(", ")
                                )
                            );

                            return;
                        } catch (e) {
                            console.error(e);
                            vscode.window.showErrorMessage(`${e}`);
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

        const relativeFilePath = path.relative(
            getWorkspaceFolderPath(),
            absFilePath
        );
        generatedFiles.push(relativeFilePath);
    };
}
