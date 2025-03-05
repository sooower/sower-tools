import path from "node:path";

import Handlebars from "handlebars";

import { fs } from "@/core";

import { prettierFormatText } from "./common";

/**
 * Render a template text with handlebars.
 * @param text - The template text.
 * @param data - The data to render the template text.
 * @param noEscape - Whether to escape html characters in the output text, default is `true`.
 * @param formatText - Whether to format the output text with 'prettier', default is `true`.
 */
export function renderText({
    text,
    data,
    noEscape = true,
    formatText = true,
}: {
    text: string;
    data: unknown;
    noEscape?: boolean;
    formatText?: boolean;
}) {
    try {
        const template = Handlebars.compile(text, {
            strict: true,
            noEscape,
        });
        const outputText = template(data);

        return formatText ? prettierFormatText(outputText) : outputText;
    } catch (e) {
        console.error(`Error rendering text.`, e);
        throw e;
    }
}

/**
 * Render a template file and save the result to the output file.
 * @param templateFilePath - The path to the template file.
 * @param outputFilePath - The path to the output file.
 * @param data - The data to render the template file.
 * @param noEscape - Whether to escape html characters in the output text, default is `true`.
 * @param formatText - Whether to format the output text with 'prettier', default is `true`.
 */
export async function renderTemplateFile({
    templateFilePath,
    outputFilePath,
    data,
    noEscape = true,
    formatText = true,
}: {
    templateFilePath: string;
    outputFilePath: string;
    data?: unknown;
    noEscape?: boolean;
    formatText?: boolean;
}) {
    try {
        if (!fs.existsSync(templateFilePath)) {
            throw new Error(`Template file "${templateFilePath}" not exits.`);
        }

        const outputText = renderText({
            text: await fs.promises.readFile(templateFilePath, "utf-8"),
            data,
            noEscape,
            formatText,
        });

        await fs.promises.mkdir(path.dirname(outputFilePath), {
            recursive: true,
        });
        await fs.promises.writeFile(outputFilePath, outputText);
    } catch (e) {
        console.error(
            `Error rendering template file "%s".`,
            templateFilePath,
            e
        );
    }
}
