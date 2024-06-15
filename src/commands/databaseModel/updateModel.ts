import { format } from "node:util";

import ts from "typescript";

import { mapAssertMethod } from "@/commands/databaseModel/utils";
import { vscode } from "@/shared";
import {
    extensionCtx,
    extensionName,
    ignoredInsertionColumns,
} from "@/shared/init";
import { ETsType } from "@/shared/types";
import { toLowerCamelCase, toUpperCamelCase } from "@/shared/utils";
import CommonUtils from "@/shared/utils/commonUtils";
import {
    findEnumDeclarationNode,
    findFuncDeclarationNode,
    findTypeDeclarationNode,
    findVariableDeclarationNode,
} from "@/shared/utils/tsUtils";
import {
    getSourceFile,
    insertTextAfterNode,
    replaceTextOfNode,
    replaceTextRangeOffset,
} from "@/shared/utils/vscUtils";

export function subscribeUpdateModel() {
    const command = vscode.commands.registerCommand(
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
    );

    extensionCtx.subscriptions.push(command);
}

type TUpdateModelOptions = {
    editor: vscode.TextEditor;
};

export async function updateModel({ editor }: TUpdateModelOptions) {
    const typTDefinitionsNode = findTypeDeclarationNode({
        sourceFile: getSourceFile(editor),
        typeName: "TDefinitions",
    });
    CommonUtils.assert(
        typTDefinitionsNode !== undefined,
        `Can not found type declaration of "TDefinitions", please check your code to generate one first.`
    );

    const typeMemberMap = extractTypeMemberMap(typTDefinitionsNode);

    const enumEColumnContent: string[] = [];
    const varkResolverContent: string[] = [];
    const typeTInsertOptionsContent: string[] = [];
    const funcInsertContent: string[] = [];

    for (const [field, { type, optional }] of typeMemberMap) {
        enumEColumnContent.push(`${toUpperCamelCase(field)} = "${field}",`);

        varkResolverContent.push(
            format(
                `[EColumn.%s]: %s,`,
                toUpperCamelCase(field),
                mapAssertMethod({
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
    }

    /* Update or insert enum EColumn node */

    const enumEColumnNodeText = `
        enum EColumn {
            ${enumEColumnContent.join("\n    ")}
        }
    `;
    const enumEColumnNode = findEnumDeclarationNode({
        sourceFile: getSourceFile(editor),
        enumName: "EColumn",
    });
    if (enumEColumnNode !== undefined) {
        await replaceTextOfNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: enumEColumnNode,
            newText: enumEColumnNodeText,
        });
    } else {
        await insertTextAfterNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: CommonUtils.mandatory(
                findVariableDeclarationNode({
                    sourceFile: getSourceFile(editor),
                    varName: "kFullQualifiedTableName",
                })
            ),
            text: enumEColumnNodeText,
        });
    }

    /* Update or insert variable kResolver node */

    const varResolverNodeText = `
        const kResolver: TResolvers = {
            ${varkResolverContent.join("\n    ")}
        };
    `;
    const varResolverNode = findVariableDeclarationNode({
        sourceFile: getSourceFile(editor),
        varName: "kResolver",
    });
    if (varResolverNode !== undefined) {
        await replaceTextRangeOffset({
            editor,
            start: varResolverNode.parent.getStart(),
            end: varResolverNode.getEnd(),
            newText: varResolverNodeText,
            endPlusOne: true,
        });
    } else {
        await insertTextAfterNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: CommonUtils.mandatory(
                findTypeDeclarationNode({
                    sourceFile: getSourceFile(editor),
                    typeName: "TResolvers",
                })
            ),
            text: varResolverNodeText,
        });
    }

    /* Update or insert type TInsertOptions node */

    const typeInsertOptionsNodeText = `
        type TInsertOptions = {
            ${typeTInsertOptionsContent.join("\n    ")}
        };
    `;
    const typeInsertOptionsNode = findTypeDeclarationNode({
        sourceFile: getSourceFile(editor),
        typeName: "TInsertOptions",
    });
    if (typeInsertOptionsNode !== undefined) {
        await replaceTextOfNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: typeInsertOptionsNode,
            newText: typeInsertOptionsNodeText,
        });
    } else {
        await insertTextAfterNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: CommonUtils.mandatory(varResolverNode),
            text: typeInsertOptionsNodeText,
        });
    }

    /* Update or insert function insert node */

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

            ${funcInsertContent.join("\n\n    ")}

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
        sourceFile: getSourceFile(editor),
        funcName: "insert",
    });
    if (funcInsertNode !== undefined) {
        await replaceTextOfNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: funcInsertNode,
            newText: funcInsertNodeText,
        });
    } else {
        await insertTextAfterNode({
            editor,
            sourceFile: getSourceFile(editor),
            node: CommonUtils.mandatory(typeInsertOptionsNode),
            text: funcInsertNodeText,
        });
    }
}

function extractTypeMemberMap(node: ts.TypeAliasDeclaration) {
    const propMap = new Map<string, { type: string; optional: boolean }>();

    if (node.type !== undefined && ts.isTypeLiteralNode(node.type)) {
        node.type.members.forEach((member) => {
            if (ts.isPropertySignature(member)) {
                const oName = member.name.getText();
                const name = oName.includes("EColumn")
                    ? toLowerCamelCase(
                          CommonUtils.mandatory(
                              oName.slice(1, -1).split(".").at(-1)
                          )
                      )
                    : oName;
                const type = member.type
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
