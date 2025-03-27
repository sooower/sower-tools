import path from "node:path";

import { extensionCtx, logger, project, vscode } from "@/core";
import { buildRangeByLineIndex, getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { checkIsColumnIgnoredInMethodOptions } from "../utils";
import { debouncedCheckColumnsStatus } from "./utils";

/**
 * Table code lens providers.
 *
 * Data structure: Map<tableProviderId -> Map(columnProviderId -> columnProviders)>
 */
const tableProviders = new Map<string, Map<string, vscode.Disposable>>();

export function registerCheckColumnsStatusListeners() {
    debouncedCheckColumnsStatus(checkColumnsStatus);
}

async function checkColumnsStatus(document: vscode.TextDocument) {
    const typTDefinitionsNode = project
        ?.getSourceFile(document.fileName)
        ?.getTypeAlias("TDefinitions");
    if (typTDefinitionsNode === undefined) {
        return;
    }

    const projectName = path.basename(
        CommonUtils.mandatory(getWorkspaceFolderPath())
    );
    const schemaName = path.basename(
        path.dirname(path.resolve(document.fileName, ".."))
    );
    const tableName = path.basename(path.dirname(document.fileName));

    const tableProviderId = `${projectName}:${schemaName}:${tableName}`;
    let columnProviders = tableProviders.get(tableProviderId);

    // Clear the map and dispose all tables providers to reset the status
    for (const columnProviders of tableProviders.values()) {
        for (const provider of columnProviders.values()) {
            provider.dispose();
        }
    }
    tableProviders.clear();
    logger.trace(
        `[column-status] all columns providers for "${tableProviderId}" has been cleared.`
    );

    // Re-register the current table providers

    tableProviders.set(tableProviderId, new Map());
    columnProviders = tableProviders.get(tableProviderId);

    typTDefinitionsNode
        .getType()
        .getProperties()
        .forEach(async it => {
            const lineNumber = it.getValueDeclaration()?.getStartLineNumber();
            if (lineNumber === undefined) {
                logger.warn(
                    `Cannot find line number for property ${it.getName()}.`
                );

                return;
            }

            const columnName = it.getName();
            const range = buildRangeByLineIndex(document, lineNumber - 1);

            // Register insert provider

            const isInsertMethodIgnored = checkIsColumnIgnoredInMethodOptions({
                method: "insert",
                document,
                columnName,
            });
            if (!isInsertMethodIgnored) {
                const insertProvider =
                    vscode.languages.registerCodeLensProvider(
                        {
                            scheme: "file",
                            pattern: document.fileName,
                        },
                        {
                            provideCodeLenses(document, token) {
                                const codeLens = new vscode.CodeLens(range, {
                                    title: "insert()",
                                    command: "",
                                    tooltip: `Column "${schemaName}"."${tableName}"."${columnName}" is included in insert() options`,
                                });

                                return [codeLens];
                            },
                        }
                    );
                const columnProviderId = `${columnName}@insert`;
                columnProviders?.set(columnProviderId, insertProvider);
                extensionCtx.subscriptions.push(insertProvider);
                logger.trace(
                    `[column-status] registered code lens provider "${tableProviderId}->${columnProviderId}".`
                );
            }

            // Register update provider

            const isUpdateMethodIgnored = checkIsColumnIgnoredInMethodOptions({
                method: "update",
                document,
                columnName,
            });
            if (!isUpdateMethodIgnored) {
                const updateProvider =
                    vscode.languages.registerCodeLensProvider(
                        {
                            scheme: "file",
                            pattern: document.fileName,
                        },
                        {
                            provideCodeLenses(document, token) {
                                const codeLens = new vscode.CodeLens(range, {
                                    title: "update()",
                                    command: "",
                                    tooltip: `Column "${schemaName}"."${tableName}"."${columnName}" is included in update() options`,
                                });

                                return [codeLens];
                            },
                        }
                    );
                const columnProviderId = `${columnName}@update`;
                columnProviders?.set(columnProviderId, updateProvider);
                extensionCtx.subscriptions.push(updateProvider);
                logger.trace(
                    `[column-status] registered code lens provider "${tableProviderId}->${columnProviderId}".`
                );
            }
        });
}
