import path from "node:path";

import Handlebars from "handlebars";

import { fs } from "@/core";

import { prettierFormatText } from "./common";

type TRenderTextOptions = {
    /**
     * The template text.
     */
    text: string;

    /**
     * The data to render the template text.
     */
    data: unknown;

    /**
     * Whether to escape html characters in the output text, default is `true`.
     */
    noEscape?: boolean;

    /**
     * Whether to format the output text with 'prettier', default is `true`.
     */
    formatText?: boolean;
};

/**
 * Render a template text with handlebars.
 *
 * @param options - options for rendering template text, see {@link TRenderTextOptions}.
 * @returns The rendered text.
 */
export function renderText({
    text,
    data,
    noEscape = true,
    formatText = true,
}: TRenderTextOptions) {
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

type TRenderTemplateFileOptions = {
    /**
     * The path to the template file.
     */
    templateFilePath: string;

    /**
     * The path to the output file.
     */
    outputFilePath: string;

    /**
     * The data to render the template file.
     */
    data?: unknown;

    /**
     * Whether to escape html characters in the output text, default is `true`.
     */
    noEscape?: boolean;

    /**
     * Whether to format the output text with 'prettier', default is `true`.
     */
    formatText?: boolean;
};

/**
 * Render a template file and save the result to the output file.
 *
 * @param options - options for rendering template file, see {@link TRenderTemplateFileOptions}.
 * @returns void.
 */
export async function renderTemplateFile({
    templateFilePath,
    outputFilePath,
    data,
    noEscape = true,
    formatText = true,
}: TRenderTemplateFileOptions) {
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
