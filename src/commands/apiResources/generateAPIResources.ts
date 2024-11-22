import pluralize from "pluralize";
import { z } from "zod";

import path from "node:path";
import { format } from "node:util";

import { fs, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { toUpperCamelCase } from "@/shared/utils";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";

interface TemplateData {
    external: {
        fileName: string;
        templateName: string;
        dynamicFileName?: boolean | undefined;
    }[];
    internal: {
        fileName: string;
        templateName: string;
        dynamicFileName?: boolean | undefined;
        prefix?: string | undefined;
    }[];
}

export function subscribeGenerateAPIResources() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.APIResources.generateAPIResources`,
        async (uri: vscode.Uri) => {
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: "Generating API Resources",
                    cancellable: false,
                },
                async (progress, token) => {
                    try {
                        const configFilePath = path.join(
                            extensionCtx.extensionPath,
                            "configs/templates.json"
                        );

                        const configText = fs.readFileSync(
                            configFilePath,
                            "utf-8"
                        );

                        const config = z
                            .object({
                                templateRoot: z.string(),
                                templates: z.record(
                                    z.string(),
                                    z.object({
                                        external: z.array(
                                            z.object({
                                                fileName: z.string(),
                                                templateName: z.string(),
                                                dynamicFileName: z
                                                    .boolean()
                                                    .optional(),
                                            })
                                        ),
                                        internal: z.array(
                                            z.object({
                                                fileName: z.string(),
                                                templateName: z.string(),
                                                dynamicFileName: z
                                                    .boolean()
                                                    .optional(),
                                                prefix: z.string().optional(),
                                            })
                                        ),
                                    })
                                ),
                            })
                            .parse(JSON.parse(configText));

                        const templateBasePath = path.join(
                            extensionCtx.extensionPath,
                            config.templateRoot
                        );

                        const templatesNames = Object.keys(config.templates);

                        const templateType = await vscode.window.showQuickPick(
                            templatesNames,
                            {
                                title: "Select a template please",
                                placeHolder: "Select a template please?",
                            }
                        );
                        if (templateType === undefined) {
                            return;
                        }

                        const input = await vscode.window.showInputBox({
                            prompt: "Input API Name please",
                            placeHolder: "API Name",
                        });
                        if (input === undefined) {
                            return;
                        }

                        const generatedAPIResources =
                            await generateAPIResources({
                                templateBasePath,
                                templateType,
                                templateData: config.templates[templateType],
                                directoryPath: path.join(uri.fsPath, input),
                            });

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

async function generateAPIResources({
    templateBasePath,
    templateType,
    templateData,
    directoryPath,
}: {
    templateBasePath: string;
    templateType: string;
    templateData: TemplateData;
    directoryPath: string;
}) {
    const apiName = path.basename(directoryPath);
    const generatedFiles: string[] = [];
    const gen = generate({
        apiName,
        directoryPath,
        templateBasePath,
        templateType,
        generatedFiles,
    });

    for (const {
        fileName,
        templateName,
        dynamicFileName,
    } of templateData.external) {
        await gen({
            fileName,
            templateName,
            dynamicFileName,
        });
    }

    for (const {
        fileName,
        templateName,
        dynamicFileName,
        prefix,
    } of templateData.internal) {
        await gen({
            fileName,
            templateName,
            dynamicFileName,
            prefix,
            isInternal: true,
        });
    }

    return generatedFiles;
}

function generate({
    apiName,
    directoryPath,
    templateBasePath,
    templateType,
    generatedFiles,
}: {
    apiName: string;
    directoryPath: string;
    templateBasePath: string;
    templateType: string;
    generatedFiles: string[];
}) {
    return async function ({
        fileName,
        templateName,
        dynamicFileName,
        prefix,
        isInternal,
    }: {
        fileName: string;
        templateName: string;
        dynamicFileName?: boolean | undefined;
        prefix?: string | undefined;
        isInternal?: boolean | undefined;
    }) {
        let finalFileName = dynamicFileName
            ? `${pluralize.singular(apiName)}${fileName}`
            : fileName;
        if (isInternal) {
            prefix = prefix ?? `@${pluralize.singular(apiName)}Id`;
            finalFileName = path.join(prefix, finalFileName);
        }
        const absoluteFilePath = path.join(directoryPath, finalFileName);
        if (!fs.existsSync(absoluteFilePath)) {
            const fileContent = fs
                .readFileSync(
                    path.join(templateBasePath, templateType, templateName),
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
