import path from "node:path";

import { Node, TypeAliasDeclaration } from "ts-morph";
import z from "zod";

import { toLowerCamelCase } from "@/modules/shared/modules/configuration/utils";

import { ETsType } from "@/types";

import {
    extensionName,
    format,
    getConfigurationItem,
    project,
    updateConfigurationItem,
    vscode,
} from "@/core";
import { mapEnumNameWithoutPrefix } from "@/utils/common";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import {
    globalIgnoredInsertionColumns,
    globalIgnoredUpdateColumns,
    projectIgnoredColumnSchema,
} from "./configs";

export type TColumnDetail = {
    tsType: string;
    nullable: boolean;
    enumType: string;
};

export function mapAssertionMethod({
    tsType,
    nullable,
    enumType,
}: TColumnDetail) {
    switch (tsType) {
        case ETsType.Number: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertSafeInteger(val)`;
            } else {
                return `(val) => CommonUtils.assertSafeInteger(val)`;
            }
        }
        case ETsType.NumberArr: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val) => CommonUtils.assertSafeInteger(val))`;
            } else {
                return `(val) => CommonUtils.assertArray(val)`;
            }
        }
        case ETsType.String: {
            if (nullable) {
                return `(val) => CommonUtils.assertNullableString(val)`;
            } else {
                return `(val) => CommonUtils.assertString(val)`;
            }
        }
        case ETsType.StringArr: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val: unknown) => CommonUtils.assertString(val))`;
            } else {
                return `(val) => CommonUtils.assertArray(val).map((val: unknown) => CommonUtils.assertString(val))`;
            }
        }
        case ETsType.Boolean: {
            if (nullable) {
                return `(val) => CommonUtils.assertNullableBoolean(val)`;
            } else {
                return `(val) => CommonUtils.assertBoolean(val)`;
            }
        }
        case ETsType.Date: {
            if (nullable) {
                return `(val) => CommonUtils.assertNullableDate(val)`;
            } else {
                return `(val) => CommonUtils.assertDate(val)`;
            }
        }
        case ETsType.Buffer: {
            if (nullable) {
                return `(val) => val === null ? undefined : CommonUtils.assertBuffer(val)`;
            } else {
                return `(val) => CommonUtils.assertBuffer(val)`;
            }
        }
        default: {
            if (tsType.endsWith("[]")) {
                if (nullable) {
                    return format(
                        `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val: unknown) => assertOptional%s(CommonUtils.assertNullableString(val)))`,
                        mapEnumNameWithoutPrefix(enumType.replace("[]", ""))
                    );
                } else {
                    return format(
                        `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val: unknown) => assert%s(CommonUtils.assertString(val)))`,
                        mapEnumNameWithoutPrefix(enumType.replace("[]", ""))
                    );
                }
            } else {
                if (nullable) {
                    return format(
                        `(val) => assertOptional%s(CommonUtils.assertNullableString(val))`,
                        mapEnumNameWithoutPrefix(enumType)
                    );
                } else {
                    return format(
                        `(val) => assert%s(CommonUtils.assertString(val))`,
                        mapEnumNameWithoutPrefix(enumType)
                    );
                }
            }
        }
    }
}

export function extractTypeMemberMap(node: TypeAliasDeclaration) {
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

export function checkIsColumnIgnoredInMethodOptions({
    method,
    document,
    columnName,
    includeGlobalIgnoredColumns = true,
}: {
    method: "insert" | "update";
    document: vscode.TextDocument;
    columnName: string;
    includeGlobalIgnoredColumns?: boolean;
}) {
    const projectName = path.basename(
        CommonUtils.mandatory(getWorkspaceFolderPath())
    );

    const schemaName = path.basename(
        path.dirname(path.resolve(document.fileName, ".."))
    );
    const tableName = path.basename(path.dirname(document.fileName));

    const section =
        method === "insert"
            ? `${extensionName}.databaseModel.projectIgnoredInsertionColumns`
            : `${extensionName}.databaseModel.projectIgnoredUpdateColumns`;
    const projectIgnoredConfigs = z
        .array(projectIgnoredColumnSchema)
        .parse(getConfigurationItem(section));
    const projectIgnoredConfig = projectIgnoredConfigs.find(
        it => it.project === projectName
    );

    if (
        includeGlobalIgnoredColumns &&
        (method === "insert"
            ? globalIgnoredInsertionColumns
            : globalIgnoredUpdateColumns
        ).includes(columnName)
    ) {
        return true;
    }

    const isColumnIgnored =
        projectIgnoredConfig?.columns
            .find(it => it.schema === schemaName && it.table === tableName)
            ?.columns.includes(columnName) ?? false;

    return isColumnIgnored;
}

export function getColumnNameByRange(
    document: vscode.TextDocument,
    range: vscode.Range
) {
    return project
        ?.getSourceFile(document.fileName)
        ?.getTypeAlias("TDefinitions")
        ?.getType()
        .getProperties()
        .filter(
            it =>
                it.getValueDeclaration()?.getStartLineNumber() ===
                range.start.line + 1
        )
        .at(0)
        ?.getName();
}

export async function removeFromIgnoredColumns(
    type: "insert" | "update",
    document: vscode.TextDocument,
    columnName: string
) {
    const projectName = path.basename(
        CommonUtils.mandatory(getWorkspaceFolderPath())
    );

    const schemaName = path.basename(
        path.dirname(path.resolve(document.fileName, ".."))
    );
    const tableName = path.basename(path.dirname(document.fileName));

    const section =
        type === "insert"
            ? `${extensionName}.databaseModel.projectIgnoredInsertionColumns`
            : `${extensionName}.databaseModel.projectIgnoredUpdateColumns`;
    const projectIgnoredConfigs = z
        .array(projectIgnoredColumnSchema)
        .parse(await getConfigurationItem(section));
    const projectIgnoredConfig = projectIgnoredConfigs.find(
        it => it.project === projectName
    );

    const columns = projectIgnoredConfig?.columns.find(
        it => it.schema === schemaName && it.table === tableName
    )?.columns;
    if (columns !== undefined && columns.includes(columnName)) {
        // Remove column from ignored columns
        columns.splice(columns.indexOf(columnName), 1);
    }

    await updateConfigurationItem(section, projectIgnoredConfigs);
}

export async function addToIgnoredColumns(
    type: "insert" | "update",
    document: vscode.TextDocument,
    columnName: string
) {
    const projectName = path.basename(
        CommonUtils.mandatory(getWorkspaceFolderPath())
    );

    const schemaName = path.basename(
        path.dirname(path.resolve(document.fileName, ".."))
    );
    const tableName = path.basename(path.dirname(document.fileName));

    const section =
        type === "insert"
            ? `${extensionName}.databaseModel.projectIgnoredInsertionColumns`
            : `${extensionName}.databaseModel.projectIgnoredUpdateColumns`;
    const projectIgnoredConfigs = z
        .array(projectIgnoredColumnSchema)
        .parse(await getConfigurationItem(section));
    const projectIgnoredConfig = projectIgnoredConfigs.find(
        it => it.project === projectName
    );

    const sourceFile = project?.getSourceFile(document.fileName);
    if (sourceFile === undefined) {
        return;
    }

    const typTDefinitionsNode = sourceFile.getTypeAlias("TDefinitions");
    if (typTDefinitionsNode === undefined) {
        return;
    }

    const newColumns = [...extractTypeMemberMap(typTDefinitionsNode).keys()];

    if (projectIgnoredConfig === undefined) {
        projectIgnoredConfigs.push({
            project: projectName,
            columns: [
                {
                    schema: schemaName,
                    table: tableName,
                    columns: [columnName],
                },
            ],
        });
    } else {
        if (projectIgnoredConfig.columns.length === 0) {
            projectIgnoredConfig.columns.push({
                schema: schemaName,
                table: tableName,
                columns: [columnName],
            });
        } else {
            const table = projectIgnoredConfig.columns.find(
                it => it.schema === schemaName && it.table === tableName
            );
            if (table === undefined) {
                projectIgnoredConfig.columns.push({
                    schema: schemaName,
                    table: tableName,
                    columns: [columnName],
                });
            } else if (!table.columns.includes(columnName)) {
                // Remove deprecated columns
                table.columns = table.columns.filter(it =>
                    newColumns.includes(it)
                );

                // Add new column
                table.columns.push(columnName);
            }
        }
    }

    await updateConfigurationItem(section, projectIgnoredConfigs);
}
