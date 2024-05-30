export class FileNotEmptyError extends Error {
    constructor(file: string) {
        super(`File "${file}" is not empty.`);
    }
}

export class CreateStatementSqlNotIncludedError extends Error {
    constructor(sql: string) {
        super(`Create statement not included, sql: ${sql}.`);
    }
}

export class NotSupportMultipleLineSqlError extends Error {
    constructor(sql: string) {
        super(`Not support multiple line, sql: ${sql}.`);
    }
}
