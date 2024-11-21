import { Cursor } from "@/modules/Database";

export function escapePGIdentifier(id: string): string {
    return id.split('"').join('""');
}

export function createQualifiedTableName(
    schemaName: string,
    tableName: string
): string {
    return `"${escapePGIdentifier(schemaName)}"."${escapePGIdentifier(
        tableName
    )}"`;
}

export function asyncCursorRead(
    cursor: Cursor,
    length: number
): Promise<any[]> {
    return new Promise((resolve, reject) => {
        cursor.read(length, (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
    });
}

export type TColumnValue = {
    column: string;
    value: any;
};

export type TGenerateCreateStatementOptions = {
    inserts: readonly TColumnValue[];
};

export type TGenerateCreateStatementReturn = {
    preparedStmt: string;
    vars: any[];
};

export function generateCreateStatement(
    fullQualifiedTableName: string,
    { inserts }: TGenerateCreateStatementOptions
): TGenerateCreateStatementReturn {
    if (inserts.length === 0) {
        throw new Error(`Unable to generate create for 0-column create.`);
    }

    const vars: unknown[] = [];

    const columns: string[] = [],
        variables: string[] = [];

    for (const insert of inserts) {
        vars.push(insert.value);
        columns.push(`"${escapePGIdentifier(insert.column)}"`);
        variables.push(`$${vars.length.toFixed(0)}`);
    }

    return {
        preparedStmt: [
            /* COMMAND */ "INSERT INTO",
            /* TABLE   */ fullQualifiedTableName,
            /* COLUMNS */ `(${columns.join(", ")})`,
            /* VALUES  */ `VALUES (${variables.join(", ")})`,
            /* EOF     */ ";",
        ].join(" "),
        vars: vars,
    };
}

export type TGenerateUpdateStatementOptions = {
    id: string;
    updates: readonly TColumnValue[];
};

export type TGenerateUpdateStatementReturn = {
    preparedStmt: string;
    vars: any[];
};

export function generateUpdateStatement(
    fullQualifiedTableName: string,
    { id, updates }: TGenerateUpdateStatementOptions
): TGenerateUpdateStatementReturn {
    const filteredUpdates = updates.filter(
        (update) => ["updatedAt"].indexOf(update.column) === -1
    );
    if (filteredUpdates.length === 0) {
        throw new Error(`Unable to generate update for 0-column update.`);
    }

    const vars: unknown[] = [id];

    const columnAssignments: string[] = [];
    for (const update of updates) {
        vars.push(update.value);
        columnAssignments.push(
            `"${escapePGIdentifier(update.column)}" = $${vars.length.toFixed(
                0
            )}`
        );
    }

    return {
        preparedStmt: [
            /* COMMAND    */ "UPDATE",
            /* TABLE      */ fullQualifiedTableName,
            /* SET        */ "SET",
            /* COLUMNS    */ columnAssignments.join(", "),
            /* WHERE      */ "WHERE",
            /* CONDITIONS */ `"id" = $1`,
            /* EOF        */ ";",
        ].join(" "),
        vars: vars,
    };
}

export type TGenerateSelectStatementOptions = {
    selects: readonly string[];
    conditions: readonly TColumnValue[];
};

export type TGenerateSelectStatementReturn = {
    preparedStmt: string;
    vars: any[];
};

export function generateSelectStatement(
    fullQualifiedTableName: string,
    { selects, conditions }: TGenerateSelectStatementOptions
): TGenerateSelectStatementReturn {
    if (selects.length === 0) {
        throw new Error(`Unable to generate select for 0-column select.`);
    }

    if (conditions.length === 0) {
        throw new Error(`Unable to generate select for 0-condition select.`);
    }

    const vars: unknown[] = [];

    const columnAssignments: string[] = [];
    for (const select of selects) {
        columnAssignments.push(`"${escapePGIdentifier(select)}"`);
    }

    const columnConditions: string[] = [];
    for (const condition of conditions) {
        if (condition.value === null) {
            columnConditions.push(
                `"${escapePGIdentifier(condition.column)}" IS NULL`
            );
            continue;
        }
        vars.push(condition.value);
        columnConditions.push(
            `"${escapePGIdentifier(condition.column)}" = $${vars.length.toFixed(
                0
            )}`
        );
    }

    return {
        preparedStmt: [
            /* COMMAND    */ "SELECT",
            /* COLUMNS    */ columnAssignments.join(", "),
            /* FROM       */ "FROM",
            /* TABLE      */ fullQualifiedTableName,
            /* WHERE      */ `WHERE`,
            /* CONDITIONS */ columnConditions.join(" AND "),
            /* EOF        */ ";",
        ].join(" "),
        vars: vars,
    };
}
