import { Node, TypeAliasDeclaration } from "ts-morph";

import {
    toLowerCamelCase,
    toUpperCamelCase,
} from "@/modules/shared/modules/configuration/utils";

import { ETsType } from "@/types";

import {
    extensionCtx,
    extensionName,
    format,
    logger,
    project,
    vscode,
} from "@/core";
import { prettierFormatText } from "@/utils/common";
import { buildRangeByNode, buildRangeByOffsets } from "@/utils/vscode/range";
import { CommonUtils } from "@utils/common";

import {
    ignoredInsertionColumns,
    ignoredUpdatingColumns,
} from "../shared/configs";
import { mapAssertionMethod } from "../shared/utils";

export function registerCommandUpdateModel() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.updateModel`,
            async (document: vscode.TextDocument) => {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Generating files",
                        cancellable: false,
                    },
                    async (progress, token) => {
                        try {
                            await createEditAndApply(document);
                        } catch (e) {
                            logger.error("Failed to generate model.", e);
                        }
                    }
                );
            }
        )
    );
}

async function createEditAndApply(document: vscode.TextDocument) {
    const sourceFile = project?.getSourceFile(document.uri.fsPath);
    if (sourceFile === undefined) {
        return;
    }

    const typTDefinitionsNode = sourceFile.getTypeAlias("TDefinitions");
    if (typTDefinitionsNode === undefined) {
        return;
    }

    const enumEColumnContent: string[] = [];
    const varKResolverContent: string[] = [];
    const typeTInsertOptionsContent: string[] = [];
    const funcInsertContent: string[] = [];
    const typeTUpdateOptionsContent: string[] = [];
    const funcUpdateContent: string[] = [];

    for (const [name, { type, optional }] of extractTypeMemberMap(
        typTDefinitionsNode
    )) {
        enumEColumnContent.push(`${toUpperCamelCase(name)} = "${name}",`);

        varKResolverContent.push(
            format(
                `[EColumn.%s]: %s,`,
                toUpperCamelCase(name),
                mapAssertionMethod({
                    tsType: type,
                    nullable: optional,
                    enumType: `${type}`,
                })
            )
        );

        if (!ignoredInsertionColumns.includes(name)) {
            typeTInsertOptionsContent.push(
                format(`%s%s: %s;`, name, optional ? "?" : "", type)
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
                          name,
                          toUpperCamelCase(name),
                          name
                      )
                    : format(
                          `
                              columnValues.push({
                                  column: EColumn.%s,
                                  value: options.%s,
                              });
                          `,
                          toUpperCamelCase(name),
                          name
                      )
            );
        }

        if (!ignoredUpdatingColumns.includes(name)) {
            typeTUpdateOptionsContent.push(format(`%s: %s;`, name, type));
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
                    name,
                    toUpperCamelCase(name),
                    name
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
            varResolverNodeText
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

    const funcInsertNodeText = `
        async function insert(dbc: DatabaseConnection, options: TInsertOptions) {
            const columnValues: TColumnValue[] = [];

            columnValues.push({
                column: EColumn.CreatedAt,
                value: new Date(),
            });

            columnValues.push({
                column: EColumn.UpdatedAt,
                value: new Date(),
            });

            ${funcInsertContent.join("\n\n")}

            const { preparedStmt, vars } = generateCreateStatement(
                kFullQualifiedTableName,
                {
                    inserts: columnValues,
                }
            );

            return await dbc.query(preparedStmt, vars);
        }
    `;
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

    const funcUpdateNodeText = `
            async function update(dbc: DatabaseConnection, id: string, options: TUpdateOptions) {
                const columnValues: TColumnValue[] = [];

                columnValues.push({
                    column: EColumn.UpdatedAt,
                    value: new Date(),
                });

                ${funcUpdateContent.join("\n\n")}

                const { preparedStmt, vars } = generateUpdateStatement(
                    kFullQualifiedTableName,
                    {
                        id: id,
                        updates: columnValues,
                    }
                );

                return await dbc.query(preparedStmt, vars);
            }
        `;
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
    const newWorkspaceEdit = new vscode.WorkspaceEdit();
    newWorkspaceEdit.replace(
        document.uri,
        buildRangeByOffsets(document, 0, document.getText().length),
        prettierFormatText(document.getText())
    );
    await vscode.workspace.applyEdit(newWorkspaceEdit);
}

function extractTypeMemberMap(node: TypeAliasDeclaration) {
    const propMap = new Map<string, { type: string; optional: boolean }>();

    const typeNode = node.getTypeNode();
    if (!Node.isTypeLiteral(typeNode)) {
        return propMap;
    }

    for (const member of typeNode.getProperties()) {
        if (!Node.isPropertySignature(member)) {
            continue;
        }

        let memberName = member.getName();
        if (memberName.includes("EColumn")) {
            memberName = toLowerCamelCase(
                CommonUtils.mandatory(memberName.slice(1, -1).split(".").at(-1))
            );
        }

        propMap.set(memberName, {
            type: member.getTypeNode()?.getText() ?? ETsType.Unknown,
            optional: member.hasQuestionToken(),
        });
    }

    return propMap;
}
