import ts from "typescript";

import {
    toLowerCamelCase,
    toUpperCamelCase,
} from "@/modules/shared/modules/configuration/utils";

import { ETsType } from "@/types";

import { format, vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";
import { prettierFormatFile } from "@/utils";
import {
    findEnumDeclarationNode,
    findFuncDeclarationNode,
    findTypeDeclarationNode,
    findVariableDeclarationNode,
} from "@/utils/typescript";
import { createSourceFileByEditor } from "@/utils/vscode";
import { textEditorUtils } from "@/utils/vscode/textEditor";
import { CommonUtils } from "@utils/common";

import { ignoredInsertionColumns, ignoredUpdatingColumns } from "../configs";
import { mapAssertionMethod } from "../utils";

export function registerCommandUpdateModel() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.updateModel`,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    if (editor.document.languageId !== "typescript") {
                        return;
                    }

                    await updateModel({ editor });
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}

type TUpdateModelOptions = {
    editor: vscode.TextEditor;
};

export async function updateModel({ editor }: TUpdateModelOptions) {
    const typTDefinitionsNode = findTypeDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        typeName: "TDefinitions",
    });
    CommonUtils.assert(
        typTDefinitionsNode !== undefined,
        `Can not found type declaration of "TDefinitions", please check your code to generate one first.`
    );

    const typeMemberMap = extractTypeMemberMap(typTDefinitionsNode);

    const enumEColumnContent: string[] = [];
    const varKResolverContent: string[] = [];
    const typeTInsertOptionsContent: string[] = [];
    const funcInsertContent: string[] = [];
    const typeTUpdateOptionsContent: string[] = [];
    const funcUpdateContent: string[] = [];

    for (const [field, { type, optional }] of typeMemberMap) {
        enumEColumnContent.push(`${toUpperCamelCase(field)} = "${field}",`);

        varKResolverContent.push(
            format(
                `[EColumn.%s]: %s,`,
                toUpperCamelCase(field),
                mapAssertionMethod({
                    tsType: type,
                    nullable: optional,
                    enumType: `${type}`,
                })
            )
        );

        if (!ignoredInsertionColumns.includes(field)) {
            typeTInsertOptionsContent.push(
                format(`%s%s: %s;`, field, optional ? "?" : "", type)
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
                          field,
                          toUpperCamelCase(field),
                          field
                      )
                    : format(
                          `
                              columnValues.push({
                                  column: EColumn.%s,
                                  value: options.%s,
                              });
                          `,
                          toUpperCamelCase(field),
                          field
                      )
            );
        }

        if (!ignoredUpdatingColumns.includes(field)) {
            typeTUpdateOptionsContent.push(format(`%s: %s;`, field, type));
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
                    field,
                    toUpperCamelCase(field),
                    field
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
    const enumEColumnNode = findEnumDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        enumName: "EColumn",
    });
    if (enumEColumnNode !== undefined) {
        await textEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            node: enumEColumnNode,
            newText: enumEColumnNodeText,
        });
    } else {
        const node = findVariableDeclarationNode({
            sourceFile: createSourceFileByEditor(editor),
            varName: "kFullQualifiedTableName",
        });
        if (node !== undefined) {
            await textEditorUtils.insertTextAfterNode({
                editor,
                sourceFile: createSourceFileByEditor(editor),
                node,
                text: enumEColumnNodeText,
            });
        }
    }

    // Update or insert variable kResolver node

    const varResolverNodeText = `
        const kResolver: TResolvers = {
            ${varKResolverContent.join("\n")}
        };
    `;
    const varResolverNode = findVariableDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        varName: "kResolver",
    });
    if (varResolverNode !== undefined) {
        await textEditorUtils.replaceTextRangeOffset({
            editor,
            start: varResolverNode.parent.getStart(),
            end: varResolverNode.getEnd(),
            newText: varResolverNodeText,
            endPlusOne: true,
        });
    } else {
        const node = findTypeDeclarationNode({
            sourceFile: createSourceFileByEditor(editor),
            typeName: "TResolvers",
        });
        if (node !== undefined) {
            await textEditorUtils.insertTextAfterNode({
                editor,
                sourceFile: createSourceFileByEditor(editor),
                node,
                text: varResolverNodeText,
            });
        }
    }

    // Update or insert type TInsertOptions node

    const typeInsertOptionsNodeText = `
        type TInsertOptions = {
            ${typeTInsertOptionsContent.join("\n")}
        };
    `;
    const typeInsertOptionsNode = findTypeDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        typeName: "TInsertOptions",
    });
    if (typeInsertOptionsNode !== undefined) {
        await textEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            node: typeInsertOptionsNode,
            newText: typeInsertOptionsNodeText,
        });
    } else {
        if (varResolverNode !== undefined) {
            await textEditorUtils.insertTextAfterNode({
                editor,
                sourceFile: createSourceFileByEditor(editor),
                node: varResolverNode,
                text: typeInsertOptionsNodeText,
            });
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
    const funcInsertNode = findFuncDeclarationNode({
        sourceFile: createSourceFileByEditor(editor),
        funcName: "insert",
    });
    if (funcInsertNode !== undefined) {
        await textEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            node: funcInsertNode,
            newText: funcInsertNodeText,
        });
    } else {
        if (typeInsertOptionsNode !== undefined) {
            await textEditorUtils.insertTextAfterNode({
                editor,
                sourceFile: createSourceFileByEditor(editor),
                node: typeInsertOptionsNode,
                text: funcInsertNodeText,
            });
        }

        // Update or insert type TUpdateOptions node

        const typeUpdateOptionsNodeText = `
        type TUpdateOptions = Partial<{
            ${typeTUpdateOptionsContent.join("\n")}
        }>;
    `;
        const typeUpdateOptionsNode = findTypeDeclarationNode({
            sourceFile: createSourceFileByEditor(editor),
            typeName: "TUpdateOptions",
        });
        if (typeUpdateOptionsNode !== undefined) {
            await textEditorUtils.replaceTextOfNode({
                editor,
                sourceFile: createSourceFileByEditor(editor),
                node: typeUpdateOptionsNode,
                newText: typeUpdateOptionsNodeText,
            });
        } else {
            if (varResolverNode !== undefined) {
                await textEditorUtils.insertTextAfterNode({
                    editor,
                    sourceFile: createSourceFileByEditor(editor),
                    node: varResolverNode,
                    text: typeUpdateOptionsNodeText,
                });
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
        const funcUpdateNode = findFuncDeclarationNode({
            sourceFile: createSourceFileByEditor(editor),
            funcName: "update",
        });
        if (funcUpdateNode !== undefined) {
            await textEditorUtils.replaceTextOfNode({
                editor,
                sourceFile: createSourceFileByEditor(editor),
                node: funcUpdateNode,
                newText: funcUpdateNodeText,
            });
        } else {
            if (typeUpdateOptionsNode !== undefined) {
                await textEditorUtils.insertTextAfterNode({
                    editor,
                    sourceFile: createSourceFileByEditor(editor),
                    node: typeUpdateOptionsNode,
                    text: funcUpdateNodeText,
                });
            }
        }

        await vscode.workspace.save(editor.document.uri);

        await textEditorUtils.replaceTextOfSourceFile({
            editor,
            sourceFile: createSourceFileByEditor(editor),
            newText: await prettierFormatFile(
                createSourceFileByEditor(editor).fileName
            ),
        });
    }
}

function extractTypeMemberMap(node: ts.TypeAliasDeclaration) {
    const propMap = new Map<string, { type: string; optional: boolean }>();

    if (node.type !== undefined && ts.isTypeLiteralNode(node.type)) {
        node.type.members.forEach(member => {
            if (ts.isPropertySignature(member)) {
                const oName = member.name.getText();
                const name = oName.includes("EColumn")
                    ? toLowerCamelCase(
                          CommonUtils.mandatory(
                              oName.slice(1, -1).split(".").at(-1)
                          )
                      )
                    : oName;
                const type =
                    member.type !== undefined
                        ? member.type.getText()
                        : ETsType.Unknown;
                const isOptional = member.questionToken !== undefined;

                propMap.set(name, {
                    type,
                    optional: isOptional,
                });
            }
        });
    }

    return propMap;
}
