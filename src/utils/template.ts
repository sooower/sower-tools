import path from "node:path";

import Handlebars from "handlebars";

import { extensionCtx, fs, logger } from "@/core";

import { prettierFormatText } from "./common";

let isRegistered = false;

/**
 * Automatically register all '.hbs' files in the partials directory. Skip
 * the registration if the partials have already been registered.
 */
async function registerPartialsIfNeeded() {
    if (isRegistered) {
        return;
    }

    const partialsDir = path.join(
        extensionCtx.extensionPath,
        "templates/databaseModel/models/partials"
    );
    const partialFiles = await fs.promises.readdir(partialsDir);
    for (const file of partialFiles) {
        const partialName = path.basename(file, path.extname(file));
        const partialContent = await fs.promises.readFile(
            path.join(partialsDir, file),
            "utf8"
        );
        Handlebars.registerPartial(partialName, partialContent);
    }

    isRegistered = true;
}

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
     * Whether to format the output text with 'prettier', default is `false`.
     */
    formatText?: boolean;
};

/**
 * Render a template text with handlebars.
 *
 * @param options - options for rendering template text, see {@link TRenderTextOptions}.
 * @returns The rendered text.
 */
export async function renderText({
    text,
    data,
    noEscape = true,
    formatText = false,
}: TRenderTextOptions) {
    try {
        await registerPartialsIfNeeded();

        const template = Handlebars.compile(text, {
            strict: true,
            noEscape,
        });
        const outputText = template(data);

        return formatText ? prettierFormatText(outputText) : outputText;
    } catch (e) {
        logger.error(`Error rendering text.`, e);
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
     * Whether to format the output text with 'prettier', default is `false`.
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
    formatText = false,
}: TRenderTemplateFileOptions) {
    try {
        if (!fs.existsSync(templateFilePath)) {
            throw new Error(`Template file "${templateFilePath}" not exits.`);
        }

        const outputText = await renderText({
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
        logger.error(`Error rendering template file "${templateFilePath}".`, e);
        throw e;
    }
}
