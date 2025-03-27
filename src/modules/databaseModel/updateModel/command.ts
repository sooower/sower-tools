import path from "node:path";

import { toUpperCamelCase } from "@/modules/shared/modules/configuration/utils";

import {
    extensionCtx,
    extensionName,
    format,
    fs,
    logger,
    project,
    vscode,
} from "@/core";
import { renderText } from "@/utils/template";
import { buildRangeByNode, formatDocument } from "@/utils/vscode";

import {
    checkIsColumnIgnoredInMethodOptions,
    extractTypeMemberMap,
    mapAssertionMethod,
} from "../utils";

export function registerCommandUpdateModel() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.updateModel`,
            async (document: vscode.TextDocument) => {
                try {
                    await vscode.workspace.save(document.uri);
                    await updateModel(document);
                } catch (e) {
                    logger.error("Failed to update model.", e);
                }
            }
        )
    );
}

async function updateModel(document: vscode.TextDocument) {
    const sourceFile = project?.getSourceFile(document.fileName);
    if (sourceFile === undefined) {
        logger.warn(
            `[update-model] cannot find sourceFile "${document.fileName}".`
        );

        return;
    }

    const typTDefinitionsNode = sourceFile.getTypeAlias("TDefinitions");
    if (typTDefinitionsNode === undefined) {
        logger.warn(
            `[update-model] cannot find type definition "TDefinitions".`
        );

        return;
    }

    const enumEColumnContent: string[] = [];
    const varKResolverContent: string[] = [];
    const typeTInsertOptionsContent: string[] = [];
    const funcInsertContent: string[] = [];
    const typeTUpdateOptionsContent: string[] = [];
    const funcUpdateContent: string[] = [];

    const schemaName = path.basename(
        path.dirname(path.resolve(document.fileName, ".."))
    );
    const tableName = path.basename(path.dirname(document.fileName));

    for (const [column, { type, optional }] of extractTypeMemberMap(
        typTDefinitionsNode
    )) {
        enumEColumnContent.push(`${toUpperCamelCase(column)} = "${column}",`);

        varKResolverContent.push(
            format(
                `[EColumn.%s]: %s,`,
                toUpperCamelCase(column),
                mapAssertionMethod({
                    tsType: type,
                    nullable: optional,
                    enumType: `${type}`,
                })
            )
        );

        // Build insert options content
        if (
            checkIsColumnIgnoredInMethodOptions({
                method: "insert",
                document,
                columnName: column,
            })
        ) {
            logger.trace(
                `[update-model] column "${column}" in table "${schemaName}"."${tableName}" is ignored in insert options.`
            );
        } else {
            typeTInsertOptionsContent.push(
                format(`%s%s: %s;`, column, optional ? "?" : "", type)
            );
            funcInsertContent.push(
                optional
                    ? format(
                          `
                              if (options.%s !== undefined) {
                                  columnValues.push({
                                      column: EColumn.%s,
                                      value: options.%s,
                                  });
                              }
                          `,
                          column,
                          toUpperCamelCase(column),
                          column
                      )
                    : format(
                          `
                              columnValues.push({
                                  column: EColumn.%s,
                                  value: options.%s,
                              });
                          `,
                          toUpperCamelCase(column),
                          column
                      )
            );
        }

        // Build update options content
        if (
            checkIsColumnIgnoredInMethodOptions({
                method: "update",
                document,
                columnName: column,
            })
        ) {
            logger.trace(
                `[update-model] column "${column}" in table "${schemaName}"."${tableName}" is ignored in update options.`
            );
        } else {
            typeTUpdateOptionsContent.push(format(`%s: %s;`, column, type));
            funcUpdateContent.push(
                format(
                    `
                        if (options.%s !== undefined) {
                            columnValues.push({
                                column: EColumn.%s,
                                value: options.%s,
                            });
                        }
                    `,
                    column,
                    toUpperCamelCase(column),
                    column
                )
            );
        }
    }

    // Update or insert enum EColumn node

    const enumEColumnNodeText = `
        enum EColumn {
            ${enumEColumnContent.join("\n")}
        }
    `;

    const workspaceEdit = new vscode.WorkspaceEdit();

    const enumEColumnNode = sourceFile.getEnum("EColumn");
    if (enumEColumnNode !== undefined) {
        workspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, enumEColumnNode),
            enumEColumnNodeText
        );
    } else {
        const kFullQualifiedTableNameNode = sourceFile.getVariableDeclaration(
            "kFullQualifiedTableName"
        );
        if (kFullQualifiedTableNameNode !== undefined) {
            workspaceEdit.insert(
                document.uri,
                new vscode.Position(
                    kFullQualifiedTableNameNode.getEndLineNumber(),
                    0
                ),
                enumEColumnNodeText
            );
        }
    }

    // Update or insert variable kResolver node

    const varResolverNodeText = `
        const kResolver: TResolvers = {
            ${varKResolverContent.join("\n")}
        };
    `;
    const varResolverNode = sourceFile.getVariableDeclaration("kResolver");
    if (varResolverNode !== undefined) {
        workspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, varResolverNode.getParent()),
            varResolverNodeText + "\n\n"
        );
    } else {
        const typeTResolversNode = sourceFile.getTypeAlias("TResolvers");
        if (typeTResolversNode !== undefined) {
            workspaceEdit.insert(
                document.uri,
                new vscode.Position(typeTResolversNode.getEndLineNumber(), 0),
                varResolverNodeText
            );
        }
    }

    // Update or insert type TInsertOptions node

    const typeInsertOptionsNodeText = `
        type TInsertOptions = {
            ${typeTInsertOptionsContent.join("\n")}
        };
    `;
    const typeTInsertOptionsNode = sourceFile.getTypeAlias("TInsertOptions");
    if (typeTInsertOptionsNode !== undefined) {
        workspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, typeTInsertOptionsNode),
            typeInsertOptionsNodeText
        );
    } else {
        if (varResolverNode !== undefined) {
            workspaceEdit.insert(
                document.uri,
                new vscode.Position(varResolverNode.getEndLineNumber(), 0),
                typeInsertOptionsNodeText
            );
        }
    }

    // Update or insert function insert node

    const funcInsertNodeText = await renderText({
        text: await fs.promises.readFile(
            path.join(
                extensionCtx.extensionPath,
                "templates/databaseModel/models/partials/funcInsert.hbs"
            ),
            "utf-8"
        ),
        data: {
            insertContent: funcInsertContent.join("\n\n"),
        },
        formatText: true,
    });
    const funcInsertNode = sourceFile.getFunction("insert");
    if (funcInsertNode !== undefined) {
        workspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, funcInsertNode),
            funcInsertNodeText
        );
    } else {
        if (typeTInsertOptionsNode !== undefined) {
            workspaceEdit.insert(
                document.uri,
                new vscode.Position(
                    typeTInsertOptionsNode.getEndLineNumber(),
                    0
                ),
                funcInsertNodeText
            );
        }
    }

    // Update or insert type TUpdateOptions node

    const typeUpdateOptionsNodeText = `
            type TUpdateOptions = Partial<{
                ${typeTUpdateOptionsContent.join("\n")}
            }>;
        `;
    const typeUpdateOptionsNode = sourceFile.getTypeAlias("TUpdateOptions");
    if (typeUpdateOptionsNode !== undefined) {
        workspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, typeUpdateOptionsNode),
            typeUpdateOptionsNodeText
        );
    } else {
        if (varResolverNode !== undefined) {
            workspaceEdit.insert(
                document.uri,
                new vscode.Position(varResolverNode.getEndLineNumber(), 0),
                typeUpdateOptionsNodeText
            );
        }
    }

    // Update or insert function update node

    const funcUpdateNodeText = await renderText({
        text: await fs.promises.readFile(
            path.join(
                extensionCtx.extensionPath,
                "templates/databaseModel/models/partials/funcUpdate.hbs"
            ),
            "utf-8"
        ),
        data: {
            updateContent: funcUpdateContent.join("\n\n"),
        },
        formatText: true,
    });
    const funcUpdateNode = sourceFile.getFunction("update");
    if (funcUpdateNode !== undefined) {
        workspaceEdit.replace(
            document.uri,
            buildRangeByNode(document, funcUpdateNode),
            funcUpdateNodeText
        );
    } else {
        if (typeUpdateOptionsNode !== undefined) {
            workspaceEdit.insert(
                document.uri,
                new vscode.Position(
                    typeUpdateOptionsNode.getEndLineNumber(),
                    0
                ),
                funcUpdateNodeText
            );
        }
    }

    await vscode.workspace.applyEdit(workspaceEdit);

    // Format the document
    await formatDocument(document);
}
