import path from "node:path";

import { extensionCtx, logger, vscode } from "@/core";

import { ignoreCompatibleConfigFilenames, loadIgnorePatterns } from "./configs";

export function registerOnDidSaveTextDocumentListener() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidSaveTextDocument(async document => {
            try {
                const isIgnoreCompatibleConfigFile =
                    ignoreCompatibleConfigFilenames.includes(
                        path.basename(document.fileName)
                    );
                if (!isIgnoreCompatibleConfigFile) {
                    return;
                }

                loadIgnorePatterns();
            } catch (e) {
                logger.error(
                    "Failed to add ignore patterns from compatible config file.",
                    e
                );
            }
        })
    );
}
