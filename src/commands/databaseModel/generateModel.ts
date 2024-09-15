import path from "node:path";
import { format } from "node:util";

import { mapAssertMethod, TColumnDetail } from "@/commands/databaseModel/utils";
import { fs, vscode } from "@/shared";
import {
    enableOverwriteFile,
    extensionCtx,
    extensionName,
    ignoredInsertionColumns,
} from "@/shared/init";
import { ETsType } from "@/shared/types";
import { reIndent, toLowerCamelCase, toUpperCamelCase } from "@/shared/utils";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";
import { CommonUtils } from "@utils/common";

enum ESqlKeywords {
    Create = "CREATE",
    Table = "TABLE",
    Constraint = "CONSTRAINT",
    PrimaryKey = "PRIMARY KEY",
    Comment = "COMMENT",
    NotNull = "NOT NULL",
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
}

export function subscribeGenerateModel() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.databaseModel.generateModel`,
        async () => {
            vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: "Generating files",
                    cancellable: false,
                },
                async (progress, token) => {
                    try {
                        const generatedFils = await parseSqlAndGenerateFiles();
                        vscode.window.showInformationMessage(
                            format(
                                `Generated files:\n%s`,
                                generatedFils.join("\n")
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

async function parseSqlAndGenerateFiles() {
    /* Get selected text */

    const editor = vscode.window.activeTextEditor;
    CommonUtils.assert(editor !== undefined, `No editor activated.`);

    const selectedText = editor.document.getText(editor.selection);

    /* Parse SQL statement */

    const { schemaName, tableName, detail } = await parseCreateStmtV2(
        selectedText
    );

    /* Check "src.models.index" file exits */

    const modelFilePath = path.join(
        getWorkspaceFolderPath(),
        "src",
        "models",
        "index.ts"
    );
    if (!fs.existsSync(modelFilePath)) {
        const modelFilePathContent = fs.readFileSync(
            path.join(
                extensionCtx.extensionPath,
                "templates",
                "src.models.index.ts.tpl"
            ),
            "utf-8"
        );
        await vscode.workspace.fs.writeFile(
            vscode.Uri.file(modelFilePath),
            Buffer.from(modelFilePathContent)
        );
    }

    /* Generate "src.models.schema.index.ts" file */

    const schemaFilePath = path.join(
        getWorkspaceFolderPath(),
        "src",
        "models",
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
                "templates",
                "src.models.schema.index.ts.tpl"
            ),
            "utf-8"
        )
        .replace(/{{schemaName}}/g, toLowerCamelCase(schemaName));

    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(schemaFilePath),
        Buffer.from(schemaFileContent)
    );
    const generatedFiles = [schemaFilePath];

    /* Generate "src.models.schema.table.index.ts" file */

    const tableFilePath = path.join(
        getWorkspaceFolderPath(),
        "src",
        "models",
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

    for (const [column, { tsType, nullable, enumType }] of detail) {
        enumEColumnContent.push(
            reIndent(`${toUpperCamelCase(column)} = "${column}",`, 4)
        );

        typeTDefinitionsContent.push(
            format(
                reIndent(`[EColumn.%s]%s: %s;`, 4),
                toUpperCamelCase(column),
                nullable ? "?" : "",
                enumType === ETsType.Unknown ? tsType : enumType
            )
        );

        varkResolverContent.push(
            format(
                reIndent(`[EColumn.%s]: %s,`, 4),
                toUpperCamelCase(column),
                mapAssertMethod({ tsType, nullable, enumType })
            )
        );

        if (!ignoredInsertionColumns.includes(column)) {
            typeTInsertOptionsContent.push(
                format(
                    reIndent(`%s%s: %s;`, 4),
                    column,
                    nullable ? "?" : "",
                    enumType === ETsType.Unknown ? tsType : enumType
                )
            );
            funcInsertContent.push(
                nullable
                    ? format(
                          reIndent(
                              `
                                if (options.%s !== undefined) {
                                    columnValues.push({
                                        column: EColumn.%s,
                                        value: options.%s,
                                    });
                                }
                            `,
                              4
                          ),
                          column,
                          toUpperCamelCase(column),
                          column
                      )
                    : format(
                          reIndent(
                              `
                                columnValues.push({
                                    column: EColumn.%s,
                                    value: options.%s,
                                });
                            `,
                              4
                          ),
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
                "templates",
                "src.models.schema.table.index.ts.tpl"
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
        .replace(/{{tableName}}/g, tableName);

    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(tableFilePath),
        Buffer.from(modelFileContent)
    );

    // Open model file in editor
    await vscode.window.showTextDocument(vscode.Uri.file(tableFilePath));

    generatedFiles.push(tableFilePath);

    return generatedFiles;
}

type TParsedCreateTableStmt = {
    schemaName: string;
    tableName: string;
    detail: Map<string, TColumnDetail>;
};

/**
 * @deprecated
 * @description Please use method `parseStmt` instead.
 */
async function parseCreateStmt(text: string) {
    CommonUtils.assert(
        text
            .toUpperCase()
            .includes(`${ESqlKeywords.Create} ${ESqlKeywords.Table}`),
        `Create statement not included, sql: ${text}.`
    );

    CommonUtils.assert(
        text.includes("\n"),
        `Not support multiple line, sql: ${text}.`
    );

    const stmts = text
        .split("\n")
        .map((it) => it.trim())
        .filter((it) => !it.toUpperCase().startsWith(ESqlKeywords.Constraint))
        .filter((it) => !it.toUpperCase().startsWith(ESqlKeywords.PrimaryKey))
        .filter((it) => it !== "")
        .filter((it) => !it.startsWith("--"))
        .join(" ")
        .split(";")
        .filter((it) => it !== "")
        .map((it) =>
            it
                .split(" ")
                .filter((it) => it !== "")
                .join(" ")
        );

    let schemaName: string | undefined;
    let tableName: string | undefined;
    const sqlDetailMap = new Map<string, TColumnDetail>();

    for (const stmt of stmts) {
        if (
            !stmt
                .toUpperCase()
                .includes(`${ESqlKeywords.Create} ${ESqlKeywords.Table}`)
        ) {
            continue;
        }

        /* Parse schema and table name */

        const str1 = stmt.slice(0, stmt.indexOf("("));
        const [schemaNameAndTableName] = str1
            .trim()
            .replaceAll('"', "")
            .split(" ")
            .slice(-1);

        CommonUtils.assert(
            schemaNameAndTableName.split(".").length >= 2,
            `Invalid schema or table name, maybe you used a default schema(public), only support format schemaName."tableName" by now.`
        );

        const splitIndex = schemaNameAndTableName.indexOf(".");
        schemaName = toLowerCamelCase(
            schemaNameAndTableName.slice(0, splitIndex)
        );
        tableName = toLowerCamelCase(
            schemaNameAndTableName.slice(
                splitIndex + 1,
                schemaNameAndTableName.length
            )
        );

        /* Parse columns */

        const str2 = stmt.slice(stmt.indexOf("(") + 1, stmt.indexOf(")"));
        const columnStrings = str2
            .split(",")
            .map((it) => it.trim())
            .filter((it) => it !== "");
        for (const columnStr of columnStrings) {
            const [columnName, columnType, ...restColumnConfigs] =
                columnStr.split(/\s/g);
            CommonUtils.assert(
                columnName !== undefined && columnType !== undefined,
                `Invalid sql text, can not parse columnName or columnType.`
            );
            sqlDetailMap.set(
                toLowerCamelCase(columnName.replace(/[`|"|']/g, "")),
                {
                    tsType: mapTsType(columnType.toUpperCase()),
                    nullable: mapNullable(restColumnConfigs),
                    enumType: mapEnumType(restColumnConfigs) ?? ETsType.Unknown,
                }
            );
        }

        // Just handle first create table statement
        break;
    }

    return {
        schemaName: CommonUtils.mandatory(schemaName),
        tableName: CommonUtils.mandatory(tableName),
        detail: sqlDetailMap,
    } satisfies TParsedCreateTableStmt;
}

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
        | "timestamp";
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

async function parseCreateStmtV2(text: string) {
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

    const createStmt = stmts.find((it) => it.type === "CreateTableStmt");
    CommonUtils.assert(
        createStmt !== undefined,
        `Can not parse create table statements from text "${text}".`
    );
    const detailMap = new Map<string, TColumnDetail>();
    const notNullColumns = createStmt.columnOrConstraints.flatMap((it) => {
        const cols = [];
        if (it.tableConstraint?.primaryKey !== undefined) {
            cols.push(...it.tableConstraint.primaryKey);
        }
        if (it.tableConstraint?.unique !== undefined) {
            cols.push(...it.tableConstraint.unique);
        }

        return cols;
    });
    createStmt.columnOrConstraints.forEach((it) => {
        const { column, type, columnConstraints } = it;
        if (column !== undefined) {
            let nullable = true;
            if (
                columnConstraints?.find((it) => it.notNull === true) !==
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

function mapTsType(columnType: string) {
    switch (columnType) {
        case ESqlType.Integer: {
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

function mapNullable(columnConfig: string[]) {
    const config = columnConfig.map((it) => it.toUpperCase()).join(" ");
    return !(
        config.includes(ESqlKeywords.NotNull) ||
        config.includes(ESqlKeywords.PrimaryKey)
    );
}

function mapEnumType(columnConfigs: string[]) {
    for (let i = 0; i < columnConfigs.length; i++) {
        if (
            columnConfigs[i].toUpperCase().includes(ESqlKeywords.Comment) &&
            i < columnConfigs.length - 1
        ) {
            return columnConfigs[i + 1].replace(/'/g, "");
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
