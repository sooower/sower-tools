/* eslint-disable @typescript-eslint/no-explicit-any */
import CommonUtils from "@/modules/CommonUtils";
import { Cursor, DatabaseConnection } from "@/modules/Database";

import { ESortOrder } from "@/types/ESortOrder";

import { kSchema } from "../";
import {
    asyncCursorRead,
    createQualifiedTableName,
    escapePGIdentifier,
    generateCreateStatement,
    generateSelectStatement,
    generateUpdateStatement,
    TColumnValue,
} from "@/models";

const kTable = "{{tableName}}" as const;

const kFullQualifiedTableName = createQualifiedTableName(kSchema, kTable);

enum EColumn {
    {{EColumnContent}}
}

type TDefinitions = {
    {{TDefinitionsContent}}
};

type TResolvers = {
    [key in EColumn]: (val: unknown) => TDefinitions[key];
};

const kResolver: TResolvers = {
    {{kResolverContent}}
};

type TInsertOptions = {
    {{TInsertOptionsContent}}
};

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

    {{insertContent}}

    const { preparedStmt, vars } = generateCreateStatement(
        kFullQualifiedTableName,
        {
            inserts: columnValues,
        }
    );

    return await dbc.query(preparedStmt, vars);
}

type TUpdateOptions = Partial<{
    {{TUpdateOptionsContent}}
}>;

async function update(
    dbc: DatabaseConnection,
    id: string,
    options: TUpdateOptions
) {
    const columnValues: TColumnValue[] = [];

    columnValues.push({
        column: EColumn.UpdatedAt,
        value: new Date(),
    });

    {{updateContent}}

    const { preparedStmt, vars } = generateUpdateStatement(
        kFullQualifiedTableName,
        {
            id: id,
            updates: columnValues,
        }
    );

    return await dbc.query(preparedStmt, vars);
}

type TSelectOneOptions<T extends EColumn> = {
    columns: T[];
};

type TSelectOneReturn<T extends EColumn> = {
    [key in T]: ReturnType<(typeof kResolver)[key]>;
};

async function selectOne<T extends EColumn>(
    dbc: DatabaseConnection,
    id: string,
    options: TSelectOneOptions<T>
): Promise<TSelectOneReturn<T> | undefined> {
    const { columns } = options;

    const { preparedStmt, vars } = generateSelectStatement(
        kFullQualifiedTableName,
        {
            selects: options.columns,
            conditions: [{ column: EColumn.ID, value: id }],
        }
    );

    const { rows } = await dbc.query(preparedStmt, vars);

    if (rows.length !== 1) {
        return undefined;
    }

    const [row] = rows;

    const entity: any = {};

    for (const column of columns) {
        const resolver = kResolver[column];
        entity[column] = resolver(row[column]);
    }

    return entity;
}

async function selectExistsByID(
    dbc: DatabaseConnection,
    id: string
): Promise<boolean> {
    const existResults = await dbc.query(
        `
            SELECT
                EXISTS (
                    SELECT
                        1
                    FROM
                        ${kFullQualifiedTableName}
                    WHERE
                        "id" = $1
                )
            AS
                "exists";
        `,
        [id]
    );
    const [{ exists }] = existResults.rows;

    return CommonUtils.assertBoolean(exists);
}

type TSelectManyOptionsFilter = {
    id?: string;
    since?: Date;
    till?: Date;
};

type TSelectManyOptionsSort = {
    field: EColumn.CreatedAt | EColumn.UpdatedAt;
    order: ESortOrder;
};

type TSelectManyOptionsRange = {
    skip: number;
    limit?: number;
};

type TSelectManyOptions<T extends EColumn> = {
    columns: T[];
    filter: TSelectManyOptionsFilter;
    sort: TSelectManyOptionsSort;
    range: TSelectManyOptionsRange;
};

type TSelectManyOptionsGeneric<T extends EColumn> = {
    skipTotal?: boolean;
} & TSelectManyOptions<T>;

type TSelectManyReturnItem<T extends EColumn> = {
    [key in T]: ReturnType<(typeof kResolver)[key]>;
};

type TSelectManyReturn<T extends EColumn> = {
    rows: () => AsyncGenerator<TSelectManyReturnItem<T>>;
    abort: () => Promise<void>;
};

type TSelectManyReturnGeneric<T extends EColumn> = {
    total?: number;
} & TSelectManyReturn<T>;

async function selectMany<T extends EColumn>(
    dbc: DatabaseConnection,
    options: TSelectManyOptionsGeneric<T>
): Promise<TSelectManyReturnGeneric<T>> {
    const { skipTotal, columns, filter, sort, range } = options;

    if (columns.length === 0) {
        throw new Error(`Unable to generate select for 0-column select.`);
    }

    const vars: {
        count: unknown[];
        rows: unknown[];
    } = {
        count: [],
        rows: [],
    };

    const columnSelectRows: string[] = [];
    for (const column of columns) {
        columnSelectRows.push(`"${escapePGIdentifier(column)}"`);
    }

    const columnConditions: {
        count: string[];
        rows: string[];
    } = {
        count: [],
        rows: [],
    };

    // Filters

    if (filter.id !== undefined) {
        vars.count.push(filter.id);
        columnConditions.count.push(
            `"${escapePGIdentifier(EColumn.ID)}" = $${vars.count.length.toFixed(
                0
            )}`
        );
        vars.rows.push(filter.id);
        columnConditions.rows.push(
            `"${escapePGIdentifier(EColumn.ID)}" = $${vars.rows.length.toFixed(
                0
            )}`
        );
    }

    if (filter.since !== undefined) {
        vars.count.push(filter.since);
        columnConditions.count.push(
            `"${escapePGIdentifier(
                sort.field
            )}" >= $${vars.count.length.toFixed(0)}`
        );
        vars.rows.push(filter.since);
        columnConditions.rows.push(
            `"${escapePGIdentifier(sort.field)}" >= $${vars.rows.length.toFixed(
                0
            )}`
        );
    }

    if (filter.till !== undefined) {
        vars.count.push(filter.till);
        columnConditions.count.push(
            `"${escapePGIdentifier(sort.field)}" < $${vars.count.length.toFixed(
                0
            )}`
        );
        vars.rows.push(filter.till);
        columnConditions.rows.push(
            `"${escapePGIdentifier(sort.field)}" < $${vars.rows.length.toFixed(
                0
            )}`
        );
    }

    if (columnConditions.count.length === 0) {
        columnConditions.count.push("TRUE");
    }
    if (columnConditions.rows.length === 0) {
        columnConditions.rows.push("TRUE");
    }

    const orderBy = [
        `"${escapePGIdentifier(sort.field)}" ${sort.order}`,
        `"${escapePGIdentifier(EColumn.ID)}" ${sort.order}`,
    ].join(", ");

    vars.rows.push(range.limit);
    const limit = `$${vars.rows.length.toFixed(0)}`;

    vars.rows.push(range.skip);
    const offset = `$${vars.rows.length.toFixed(0)}`;

    const preparedStmtCount = [
        /* COMMAND    */ "SELECT",
        /* COLUMNS    */ `COUNT(*) as "count"`,
        /* FROM       */ "FROM",
        /* TABLE      */ kFullQualifiedTableName,
        /* WHERE      */ `WHERE`,
        /* CONDITIONS */ columnConditions.count.join(" AND "),
        /* EOF        */ ";",
    ].join(" ");

    const preparedStmtRows = [
        /* COMMAND    */ "SELECT",
        /* COLUMNS    */ columnSelectRows.join(", "),
        /* FROM       */ "FROM",
        /* TABLE      */ kFullQualifiedTableName,
        /* WHERE      */ `WHERE`,
        /* CONDITIONS */ columnConditions.rows.join(" AND "),
        /* ORDER BY   */ `ORDER BY`,
        /* ORDER BY   */ orderBy,
        /* LIMIT      */ `LIMIT`,
        /* LIMIT      */ limit,
        /* OFFSET     */ `OFFSET`,
        /* OFFSET     */ offset,
        /* EOF        */ ";",
    ].join(" ");

    let total: number | undefined;

    if (skipTotal !== true) {
        const { rows } = await dbc.query(preparedStmtCount, vars.count);

        CommonUtils.assert(
            rows.length === 1,
            `Unable to calculate total number of rows.`
        );

        const [row] = rows;

        total = CommonUtils.parseIntSafe(
            CommonUtils.assertString(row.count) // COUNT() returns bigint
        );
    }

    const cursor = dbc.queryCursor(new Cursor(preparedStmtRows, vars.rows));

    const batchSize = 500;

    return {
        total: total,
        rows: async function* rows() {
            let rows = await asyncCursorRead(cursor, batchSize);
            while (rows.length > 0) {
                for (const row of rows) {
                    const entity: any = {};

                    for (const column of columns) {
                        const resolver = kResolver[column];

                        entity[column] = resolver(row[column]);
                    }

                    yield entity as TSelectManyReturnItem<T>;
                }

                rows = await asyncCursorRead(cursor, batchSize);
            }
        },
        abort: async () =>
            await new Promise((resolve) => cursor.close(resolve)),
    };
}

export const {{modelName}}Dao = {
    EColumn,
    insert,
    update,
    selectOne,
    selectExistsByID,
    selectMany,
};