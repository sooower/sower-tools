import path from "node:path";

import { vscode } from "@/core";
import { CommonUtils } from "@utils/common";

export enum ELanguageId {
    TypeScript = "typescript",
    Markdown = "markdown",
}

export function getTrimmedLineText(
    document: vscode.TextDocument,
    lineIndex: number
) {
    return document.lineAt(lineIndex).text.trim();
}

export function isTypeScriptFile(filePath: string): boolean;
export function isTypeScriptFile(document: vscode.TextDocument): boolean;
export function isTypeScriptFile(arg: string | vscode.TextDocument): boolean {
    if (CommonUtils.isString(arg)) {
        return path.extname(arg).toLowerCase() === ".ts";
    }

    return arg.languageId === ELanguageId.TypeScript;
}

export function isMarkdownFile(filePath: string): boolean;
export function isMarkdownFile(document: vscode.TextDocument): boolean;
export function isMarkdownFile(arg: string | vscode.TextDocument): boolean {
    if (CommonUtils.isString(arg)) {
        return path.extname(arg).toLowerCase() === ".md";
    }

    return arg.languageId === ELanguageId.Markdown;
}
