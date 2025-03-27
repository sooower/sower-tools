import path from "node:path";

import {
    toLowerCamelCase,
    toUpperCamelCase,
} from "@/modules/shared/modules/configuration/utils";

import { ETsType } from "@/types";

import {
    extensionCtx,
    extensionName,
    format,
    fs,
    logger,
    vscode,
} from "@/core";
import { renderTemplateFile } from "@/utils/template";
import {
    getPossibleWorkspaceRelativePath,
    getWorkspaceFolderPath,
} from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import {
    enableOverwriteFile,
    globalIgnoredInsertionColumns,
    globalIgnoredUpdateColumns,
} from "../configs";
import { mapAssertionMethod, TColumnDetail } from "../utils";

export function registerCommandGenerateModel() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.databaseModel.generateModel`,
            async (document: vscode.TextDocument, range: vscode.Range) => {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Generating files",
                        cancellable: false,
                    },
                    async (progress, token) => {
                        try {
                            const generatedFiles =
                                await parseSqlAndGenerateFiles(
                                    document.getText(range)
                                );
                            if (generatedFiles === undefined) {
                                return;
                            }

                            logger.info(
                                `Generated ${generatedFiles.length} files.\n`,
                                generatedFiles.map(it => `- '${it}'`).join("\n")
                            );

                            return;
                        } catch (e) {
                            logger.error("Failed to generate model.", e);
                        }
                    }
                );
            }
        )
    );
}

async function parseSqlAndGenerateFiles(text: string) {
    // Parse SQL statement

    const { schemaName, tableName, detail } = await parseCreateStmt(text);

    const generatedFiles: string[] = [];

    // Generate "src.models.index" file

    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const modelFilePath = path.join(workspaceFolderPath, "src/models/index.ts");
    if (!fs.existsSync(modelFilePath)) {
        await renderTemplateFile({
            templateFilePath: path.join(
                extensionCtx.extensionPath,
                "templates/databaseModel/models/src.models.index.ts.hbs"
            ),
            outputFilePath: modelFilePath,
            formatText: true,
        });
        generatedFiles.push(getPossibleWorkspaceRelativePath(modelFilePath));
    }

    // Generate "src.models.schema.index.ts" file

    const schemaFilePath = path.join(
        workspaceFolderPath,
        "src/models",
        schemaName,
        "index.ts"
    );
    if (!enableOverwriteFile) {
        assertFileNotEmpty(schemaFilePath);
    }

    await renderTemplateFile({
        templateFilePath: path.join(
            extensionCtx.extensionPath,
            "templates/databaseModel/models/src.models.schema.index.ts.hbs"
        ),
        outputFilePath: schemaFilePath,
        data: {
            schemaName: toLowerCamelCase(schemaName),
        },
        formatText: true,
    });

    generatedFiles.push(getPossibleWorkspaceRelativePath(schemaFilePath));

    // Generate "src.models.schema.table.index.ts" file

    const tableFilePath = path.join(
        workspaceFolderPath,
        "src/models",
        schemaName,
        tableName,
        "index.ts"
    );

    if (!enableOverwriteFile) {
        assertFileNotEmpty(tableFilePath);
    }

    const enumEColumnContent: string[] = [];
    const typeTDefinitionsContent: string[] = [];
    const varkResolverContent: string[] = [];
    const typeTInsertOptionsContent: string[] = [];
    const funcInsertContent: string[] = [];
    const typeTUpdateOptionsContent: string[] = [];
    const funcUpdateContent: string[] = [];

    for (const [column, { tsType, nullable, enumType }] of detail) {
        CommonUtils.assert(
            !column.includes("_"),
            `Column "${column}" in table "${schemaName}"."${tableName}" includes underscore character "_", only support camel case.`
        );

        enumEColumnContent.push(`${toUpperCamelCase(column)} = "${column}",`);

        typeTDefinitionsContent.push(
            format(
                `[EColumn.%s]%s: %s;`,
                toUpperCamelCase(column),
                nullable ? "?" : "",
                enumType === ETsType.Unknown ? tsType : enumType
            )
        );

        varkResolverContent.push(
            format(
                `[EColumn.%s]: %s,`,
                toUpperCamelCase(column),
                mapAssertionMethod({ tsType, nullable, enumType })
            )
        );

        // Build insert options contents
        if (!globalIgnoredInsertionColumns.includes(column)) {
            typeTInsertOptionsContent.push(
                format(
                    `%s%s: %s;`,
                    column,
                    nullable ? "?" : "",
                    enumType === ETsType.Unknown ? tsType : enumType
                )
            );
            funcInsertContent.push(
                nullable
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

        // Build update options contents
        if (!globalIgnoredUpdateColumns.includes(column)) {
            typeTUpdateOptionsContent.push(
                format(
                    `%s: %s;`,
                    column,
                    enumType === ETsType.Unknown ? tsType : enumType
                )
            );
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

    await renderTemplateFile({
        templateFilePath: path.join(
            extensionCtx.extensionPath,
            "templates/databaseModel/models/src.models.schema.table.index.ts.hbs"
        ),
        outputFilePath: tableFilePath,
        data: {
            EColumnContent: enumEColumnContent.join("\n"),
            TDefinitionsContent: typeTDefinitionsContent.join("\n"),
            kResolverContent: varkResolverContent.join("\n"),
            TInsertOptionsContent: typeTInsertOptionsContent.join("\n"),
            insertContent: funcInsertContent.join("\n"),
            TUpdateOptionsContent: typeTUpdateOptionsContent.join("\n"),
            updateContent: funcUpdateContent.join("\n"),
            tableName,
            modelName: toLowerCamelCase(tableName),
        },
        formatText: true,
    });

    // Open model file in editor
    await vscode.window.showTextDocument(vscode.Uri.file(tableFilePath));

    generatedFiles.push(getPossibleWorkspaceRelativePath(tableFilePath));

    return generatedFiles;
}

type TParsedCreateTableStmt = {
    schemaName: string;
    tableName: string;
    detail: Map<string, TColumnDetail>;
};

type TStatement = {
    type: "CreateTableStmt" | "Comment" | "AlterTableStmt";
    table?: { schemaName: string | null; tableName: string };
    columnOrConstraints: TColumnOrConstraints[];
};

type TColumnOrConstraints = {
    column?: string;
    type?:
        | "integer"
        | "integer[]"
        | "text"
        | "text[]"
        | "serial"
        | "bigserial"
        | "boolean"
        | "timestamp"
        | "smallint";
    columnConstraints?: {
        notNull?: boolean;
        default?: string;
        collate?: string;
    }[];
    tableConstraint?: {
        primaryKey?: string[];
        unique?: string;
    };
};

async function parseCreateStmt(text: string) {
    const parser = require("@lib/sqlParser");

    let stmts: TStatement[] = [];
    try {
        stmts = parser.parse(text.trim());
    } catch (e: any) {
        if (e.location !== undefined) {
            throw new Error(
                format(
                    `syntax error at or near: %s. \n%s\nlocation: %s:%s~%s:%s.`,
                    text
                        .split("\n")
                        [e.location.start.line - 1].slice(
                            e.location.start.column - 1,
                            -1
                        ),
                    e.message,
                    e.location.start.line,
                    e.location.start.column,
                    e.location.end.line,
                    e.location.end.column
                )
            );
        } else {
            throw new Error(e);
        }
    }

    const createStmt = stmts.find(it => it.type === "CreateTableStmt");
    CommonUtils.assert(
        createStmt !== undefined,
        `Can not parse create table statements from text "${text}".`
    );
    const detailMap = new Map<string, TColumnDetail>();
    const notNullColumns = createStmt.columnOrConstraints.flatMap(it => {
        const cols = [];
        if (it.tableConstraint?.primaryKey !== undefined) {
            cols.push(...it.tableConstraint.primaryKey);
        }
        if (it.tableConstraint?.unique !== undefined) {
            cols.push(...it.tableConstraint.unique);
        }

        return cols;
    });
    createStmt.columnOrConstraints.forEach(it => {
        const { column, type, columnConstraints } = it;
        if (column !== undefined) {
            let nullable = true;
            if (
                columnConstraints?.find(it => it.notNull === true) !==
                    undefined ||
                notNullColumns.includes(column)
            ) {
                nullable = false;
            }

            detailMap.set(column, {
                tsType: mapTsType(CommonUtils.mandatory(type)),
                nullable,
                enumType: ETsType.Unknown,
            });
        }
    });

    return {
        schemaName: CommonUtils.mandatory(createStmt.table?.schemaName),
        tableName: CommonUtils.mandatory(createStmt.table?.tableName),
        detail: detailMap,
    } satisfies TParsedCreateTableStmt;
}

enum ESqlType {
    Integer = "integer",
    IntegerArr = "integer[]",
    Bigint = "bigint",
    Serial = "serial",
    Bigserial = "bigserial",
    Char = "char",
    Varchar = "varchar",
    Text = "text",
    TextArr = "text[]",
    Timestamp = "timestamp",
    Boolean = "boolean",
    Bytea = "bytea",
    Smallint = "smallint",
}

function mapTsType(columnType: string) {
    switch (columnType) {
        case ESqlType.Integer:
        case ESqlType.Smallint: {
            return ETsType.Number;
        }
        case ESqlType.IntegerArr: {
            return ETsType.NumberArr;
        }
        case ESqlType.Bigint:
        case ESqlType.Serial:
        case ESqlType.Bigserial:
        case ESqlType.Char:
        case ESqlType.Varchar:
        case ESqlType.Text: {
            return ETsType.String;
        }
        case ESqlType.TextArr: {
            return ETsType.StringArr;
        }
        case ESqlType.Boolean: {
            return ETsType.Boolean;
        }
        case ESqlType.Timestamp: {
            return ETsType.Date;
        }
        case ESqlType.Bytea: {
            return ETsType.Buffer;
        }
        default: {
            throw new Error(`Unexpected columnType "${columnType}".`);
        }
    }
}

function assertFileNotEmpty(filePath: string) {
    CommonUtils.assert(
        !fs.existsSync(filePath) ||
            fs.readFileSync(filePath, "utf-8").trim() === "",
        `File "${filePath}" is not empty, please enable overwrite file settings.`
    );
}
