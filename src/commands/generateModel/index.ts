import path from "node:path";
import { format } from "node:util";

import { fs, vscode } from "../../shared";
import {
    enableOverwriteFile,
    extensionCtx,
    extensionName,
} from "../../shared/init";
import { ETsType } from "../../shared/types";
import {
    mapEnumNameWithoutPrefix,
    toLowerCamelCase,
    toUpperCamelCase,
} from "../../shared/utils";
import CommonUtils from "../../shared/utils/commonUtils";

enum ESqlKeywords {
    Create = "CREATE",
    Table = "TABLE",
    Constraint = "CONSTRAINT",
    PrimaryKey = "PRIMARY KEY",
    Comment = "COMMENT",
    NotNull = "NOT NULL",
}

enum ESqlType {
    Integer = "INTEGER",
    IntegerArr = "INTEGER[]",
    Bigint = "BIGINT",
    Serial = "SERIAL",
    Bigserial = "BIGSERIAL",
    Char = "CHAR",
    Varchar = "VARCHAR",
    Text = "TEXT",
    TextArr = "TEXT[]",
    Timestamp = "TIMESTAMP",
    Boolean = "BOOLEAN",
    Bytea = "BYTEA",
}

export function subscribeGenerateModel() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.generateModel`,
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
                                `Generate files successfully.\n%s`,
                                generatedFils.map((it) => `> ${it}`).join("\n")
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

    const { schemaName, tableName, detail } = await parseCreateStmt(
        selectedText
    );

    /* Generate schema file */

    const [workspaceFolder] = CommonUtils.mandatory(
        vscode.workspace.workspaceFolders
    );
    const schemaFilePath = path.join(
        workspaceFolder.uri.path,
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
            path.join(extensionCtx.extensionPath, "templates", "schema.tpl"),
            "utf-8"
        )
        .replace(/{{schemaName}}/g, toLowerCamelCase(schemaName));

    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(schemaFilePath),
        Buffer.from(schemaFileContent)
    );
    const generatedFiles = [schemaFilePath];

    /* Generate model file */

    const modelFilePath = path.join(
        workspaceFolder.uri.path,
        "src",
        "models",
        schemaName,
        tableName,
        "index.ts"
    );
    if (!enableOverwriteFile) {
        assertFileNotEmpty(modelFilePath);
    }

    const columnContent: string[] = [];
    const definitionsContent: string[] = [];
    const resolverContent: string[] = [];
    const insertOptionsContent: string[] = [];
    const insertContent: string[] = [];

    for (const [column, { tsType, nullable, enumType }] of detail) {
        columnContent.push(`${toUpperCamelCase(column)} = "${column}",`);
        definitionsContent.push(
            format(
                `[EColumn.%s]%s: %s;`,
                toUpperCamelCase(column),
                nullable ? "?" : "",
                enumType === ETsType.Unknown ? tsType : enumType
            )
        );
        resolverContent.push(
            format(
                `[EColumn.%s]: %s,`,
                toUpperCamelCase(column),
                mapAssertMethod({ tsType, nullable, enumType })
            )
        );
        insertOptionsContent.push(
            format(
                `%s%s: %s;`,
                column,
                nullable ? "?" : "",
                enumType === ETsType.Unknown ? tsType : enumType
            )
        );
        insertContent.push(
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

    const modelFileContent = fs
        .readFileSync(
            path.join(extensionCtx.extensionPath, "templates", "model.tpl"),
            "utf-8"
        )
        .replace(/{{EColumnContent}}/g, columnContent.join("\n    "))
        .replace(/{{TDefinitionsContent}}/g, definitionsContent.join("\n    "))
        .replace(/{{kResolverContent}}/g, resolverContent.join("\n    "))
        .replace(
            /{{TInsertOptionsContent}}/g,
            insertOptionsContent.join("\n    ")
        )
        .replace(/{{insertContent}}/g, insertContent.join("\n    "))
        .replace(/{{tableName}}/g, toLowerCamelCase(tableName));

    await vscode.workspace.fs.writeFile(
        vscode.Uri.file(modelFilePath),
        Buffer.from(modelFileContent)
    );
    generatedFiles.push(modelFilePath);

    // Open model file in editor
    await vscode.window.showTextDocument(vscode.Uri.file(modelFilePath));

    return generatedFiles;
}

type TColumnDetail = {
    tsType: ETsType;
    nullable: boolean;
    enumType: string;
};

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
            const [columnName, columnType, ...columnConfig] =
                columnStr.split(" ");
            CommonUtils.assert(
                columnName !== undefined && columnType !== undefined,
                `Invalid sql text, can not parse columnName or columnType.`
            );
            sqlDetailMap.set(
                toLowerCamelCase(columnName.replace(/[`|"|']/g, "")),
                {
                    tsType: mapTsType(columnType.toUpperCase()),
                    nullable: mapNullable(columnConfig),
                    enumType: mapEnumType(columnConfig) ?? ETsType.Unknown,
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
    };
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

function mapEnumType(columnConfig: string[]) {
    for (let i = 0; i < columnConfig.length; i++) {
        if (
            columnConfig[i].toUpperCase().includes(ESqlKeywords.Comment) &&
            i < columnConfig.length - 1
        ) {
            return columnConfig[i + 1].replace(/'/g, "");
        }
    }
}

function mapAssertMethod({ tsType, nullable, enumType }: TColumnDetail) {
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
                if (enumType !== ETsType.Unknown) {
                    return format(
                        `(val) => CommonUtils.assertNullableEnum("%s", { type: %s, val })`,
                        mapEnumNameWithoutPrefix(enumType),
                        enumType
                    );
                } else {
                    return `(val) => CommonUtils.assertNullableString(val)`;
                }
            } else {
                if (enumType !== ETsType.Unknown) {
                    return format(
                        `(val) => CommonUtils.assertEnum("%s", { type: %s, val })`,
                        mapEnumNameWithoutPrefix(enumType),
                        enumType
                    );
                } else {
                    return `(val) => CommonUtils.assertString(val)`;
                }
            }
        }
        case ETsType.StringArr: {
            if (nullable) {
                if (enumType !== ETsType.Unknown) {
                    return format(
                        `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val) => CommonUtils.assertEnum("%s", { type: %s, val }))`,
                        mapEnumNameWithoutPrefix(enumType),
                        enumType
                    );
                } else {
                    return `(val) => val === null ? undefined : CommonUtils.assertArray(val).map((val) => CommonUtils.assertString(val))`;
                }
            } else {
                if (enumType !== ETsType.Unknown) {
                    return format(
                        `(val) => CommonUtils.assertArray(val).map((val) => CommonUtils.assertEnum("%s", { type: %s, val }))`,
                        mapEnumNameWithoutPrefix(enumType),
                        enumType
                    );
                } else {
                    return `(val) => CommonUtils.assertArray(val).map((val) => CommonUtils.assertString(val))`;
                }
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
            throw new Error(`Unexpected tsType "${tsType}".`);
        }
    }
}

function assertFileNotEmpty(filePath: string) {
    CommonUtils.assert(
        !fs.existsSync(filePath) ||
            fs.readFileSync(filePath, "utf-8").trim() === "",
        `File "${filePath}" is not empty.`
    );
}
