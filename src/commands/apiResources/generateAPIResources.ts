import pluralize from "pluralize";

import path from "node:path";
import { format } from "node:util";

import { fs, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { toUpperCamelCase } from "@/shared/utils";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";

export function subscribeGenerateAPIResources() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.APIResources.generateAPIResources`,
        async (uri: vscode.Uri) => {
            console.log(uri.fsPath);
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
                        if (!input) {
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
                                    .map((it) => `'${it}'`)
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
    );

    extensionCtx.subscriptions.push(command);
}

async function generateAPIResources(directoryPath: string) {
    const apiName = path.basename(directoryPath);
    const fileTemplateData = [
        {
            filePath: "index.ts",
            templatePath: "templates/api/src.api.index.ts.tpl",
        },
        {
            filePath: `${pluralize.singular(apiName)}ListGet.ts`,
            templatePath: "templates/api/src.api.list.ts.tpl",
        },
        {
            filePath: `${pluralize.singular(apiName)}Create.ts`,
            templatePath: "templates/api/src.api.create.ts.tpl",
        },
        {
            filePath: `@id/index.ts`,
            templatePath: "templates/api/@id/src.api.index.ts.tpl",
        },
        {
            filePath: `@id/${pluralize.singular(apiName)}Get.ts`,
            templatePath: "templates/api/@id/src.api.get.ts.tpl",
        },
        {
            filePath: `@id/${pluralize.singular(apiName)}Update.ts`,
            templatePath: "templates/api/@id/src.api.update.ts.tpl",
        },
        {
            filePath: `@id/${pluralize.singular(apiName)}Delete.ts`,
            templatePath: "templates/api/@id/src.api.delete.ts.tpl",
        },
    ];

    const generatedFiles: string[] = [];

    const gen = generate({ apiName, directoryPath, generatedFiles });
    for (const { filePath, templatePath } of fileTemplateData) {
        await gen({ filePath, templatePath });
    }

    return generatedFiles;
}

function generate({
    apiName,
    directoryPath,
    generatedFiles,
}: {
    apiName: string;
    directoryPath: string;
    generatedFiles: string[];
}) {
    return async function ({
        filePath,
        templatePath,
    }: {
        filePath: string;
        templatePath: string;
    }) {
        const absoluteFilePath = path.join(directoryPath, filePath);
        if (!fs.existsSync(absoluteFilePath)) {
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
                vscode.Uri.file(absoluteFilePath),
                Buffer.from(fileContent)
            );

            generatedFiles.push(
                path.relative(getWorkspaceFolderPath(), absoluteFilePath)
            );
        }
    };
}
