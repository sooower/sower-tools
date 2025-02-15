import path from "node:path";

import { z } from "zod";

import { vscode } from "@/shared";
import { readJsonFile } from "@utils/fs";

export let extensionCtx: vscode.ExtensionContext;
export let extensionName: string;

/**
 * Initialize extension context.
 *
 * @param context - The extension context.
 */
export function initializeContext(context: vscode.ExtensionContext) {
    const { name } = z
        .object({ name: z.string() })
        .parse(readJsonFile(path.join(context.extensionPath, "package.json")));

    extensionCtx = context;
    extensionName = name;
}
