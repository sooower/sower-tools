export * as fs from "node:fs";
export * as os from "node:os";
export { format } from "node:util";

export * as vscode from "vscode";

export enum ETsType {
    Number = "number",
    NumberArr = "number[]",
    String = "string",
    StringArr = "string[]",
    Boolean = "boolean",
    Date = "Date",
    Buffer = "Buffer",
    Unknown = "unknown",
    Any = "any",
    AnyArr = "any[]",
}
