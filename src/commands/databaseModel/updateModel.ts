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
import { getSourceFileByEditor } from "@/shared/utils/vscode";
import { TextEditorUtils } from "@/shared/utils/vscode/textEditorUtils";

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
        sourceFile: getSourceFileByEditor(editor),
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

    for (const [field, { type, optional }] of typeMemberMap) {
        enumEColumnContent.push(`${toUpperCamelCase(field)} = "${field}",`);

        varKResolverContent.push(
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
        sourceFile: getSourceFileByEditor(editor),
        enumName: "EColumn",
    });
    if (enumEColumnNode !== undefined) {
        await TextEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: enumEColumnNode,
            newText: enumEColumnNodeText,
        });
    } else {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: CommonUtils.mandatory(
                findVariableDeclarationNode({
                    sourceFile: getSourceFileByEditor(editor),
                    varName: "kFullQualifiedTableName",
                })
            ),
            text: enumEColumnNodeText,
        });
    }

    /* Update or insert variable kResolver node */

    const varResolverNodeText = `
        const kResolver: TResolvers = {
            ${varKResolverContent.join("\n    ")}
        };
    `;
    const varResolverNode = findVariableDeclarationNode({
        sourceFile: getSourceFileByEditor(editor),
        varName: "kResolver",
    });
    if (varResolverNode !== undefined) {
        await TextEditorUtils.replaceTextRangeOffset({
            editor,
            start: varResolverNode.parent.getStart(),
            end: varResolverNode.getEnd(),
            newText: varResolverNodeText,
            endPlusOne: true,
        });
    } else {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: CommonUtils.mandatory(
                findTypeDeclarationNode({
                    sourceFile: getSourceFileByEditor(editor),
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
        sourceFile: getSourceFileByEditor(editor),
        typeName: "TInsertOptions",
    });
    if (typeInsertOptionsNode !== undefined) {
        await TextEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: typeInsertOptionsNode,
            newText: typeInsertOptionsNodeText,
        });
    } else {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
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
        sourceFile: getSourceFileByEditor(editor),
        funcName: "insert",
    });
    if (funcInsertNode !== undefined) {
        await TextEditorUtils.replaceTextOfNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
            node: funcInsertNode,
            newText: funcInsertNodeText,
        });
    } else {
        await TextEditorUtils.insertTextAfterNode({
            editor,
            sourceFile: getSourceFileByEditor(editor),
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
