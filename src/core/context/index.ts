import path from "node:path";

import { z } from "zod";

import { readJsonFile } from "@utils/fs";

import { vscode } from "..";

export let extensionCtx: vscode.ExtensionContext;
export let extensionName: string;
export let extensionDisplayName: string;

/**
 * Initialize extension context.
 *
 * @param context - The extension context.
 */
export function initializeContext(context: vscode.ExtensionContext) {
    const { name, displayName } = z
        .object({ name: z.string(), displayName: z.string() })
        .parse(readJsonFile(path.join(context.extensionPath, "package.json")));

    extensionCtx = context;
    extensionName = name;
    extensionDisplayName = displayName;
}
