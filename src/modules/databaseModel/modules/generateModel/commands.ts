import path from "node:path";

import {
    toLowerCamelCase,
    toUpperCamelCase,
} from "@/modules/shared/modules/configuration/utils";

import { ETsType } from "@/types";

import { extensionCtx, format, fs, logger, vscode } from "@/core";
import { prettierFormatText } from "@/utils/common";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import {
    enableOverwriteFile,
    ignoredInsertionColumns,
    ignoredUpdatingColumns,
} from "../shared/configs";
import { mapAssertionMethod, TColumnDetail } from "../shared/utils";
import { kGenerateModelCodeAction } from "./consts";

export function registerCommandGenerateModel() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            kGenerateModelCodeAction,
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
        const modelFilePathContent = fs.readFileSync(
            path.join(
                extensionCtx.extensionPath,
                "templates/models/src.models.index.ts.tpl"
            ),
            "utf-8"
        );
        fs.mkdirSync(path.dirname(modelFilePath), { recursive: true });
        fs.writeFileSync(modelFilePath, modelFilePathContent);

        generatedFiles.push(path.relative(workspaceFolderPath, modelFilePath));
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

    const schemaFileContent = fs
        .readFileSync(
            path.join(
                extensionCtx.extensionPath,
                "templates/models/src.models.schema.index.ts.tpl"
            ),
            "utf-8"
        )
        .replace(/{{schemaName}}/g, toLowerCamelCase(schemaName));

    fs.mkdirSync(path.dirname(schemaFilePath), { recursive: true });
    fs.writeFileSync(schemaFilePath, schemaFileContent);

    generatedFiles.push(path.relative(workspaceFolderPath, schemaFilePath));

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

        if (!ignoredInsertionColumns.includes(column)) {
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

        if (!ignoredUpdatingColumns.includes(column)) {
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
    const modelFileContent = fs
        .readFileSync(
            path.join(
                extensionCtx.extensionPath,
                "templates/models/src.models.schema.table.index.ts.tpl"
            ),
            "utf-8"
        )
        .replace(/{{EColumnContent}}/g, enumEColumnContent.join("\n"))
        .replace(/{{TDefinitionsContent}}/g, typeTDefinitionsContent.join("\n"))
        .replace(/{{kResolverContent}}/g, varkResolverContent.join("\n"))
        .replace(
            /{{TInsertOptionsContent}}/g,
            typeTInsertOptionsContent.join("\n")
        )
        .replace(/{{insertContent}}/g, funcInsertContent.join("\n"))
        .replace(
            /{{TUpdateOptionsContent}}/g,
            typeTUpdateOptionsContent.join("\n")
        )
        .replace(/{{updateContent}}/g, funcUpdateContent.join("\n"))
        .replace(/{{tableName}}/g, tableName)
        .replace(/{{modelName}}/g, toLowerCamelCase(tableName));

    fs.mkdirSync(path.dirname(tableFilePath), { recursive: true });
    fs.writeFileSync(tableFilePath, prettierFormatText(modelFileContent));

    // Open model file in editor
    await vscode.window.showTextDocument(vscode.Uri.file(tableFilePath));

    generatedFiles.push(path.relative(workspaceFolderPath, tableFilePath));

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
