import path from "node:path";

import { fs, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";

import { readmeDocumentNames } from "./configs";

export async function previewDocument() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    if (vscode.window.activeTextEditor !== undefined) {
        return;
    }

    if (readmeDocumentNames.length === 0) {
        logger.warn(`No README document found in the workspace.`);

        return;
    }

    for (const docName of readmeDocumentNames) {
        const readmeFilePath = path.join(workspaceFolderPath, docName);
        if (!fs.existsSync(readmeFilePath)) {
            continue;
        }

        try {
            await vscode.window.showTextDocument(
                vscode.Uri.file(readmeFilePath)
            );
            await vscode.commands.executeCommand(
                "markdown-preview-enhanced.openPreview",
                vscode.Uri.file(readmeFilePath)
            );

            return;
        } catch (e) {
            logger.error(`Failed to preview README document: "${docName}".`, e);
        }
    }
}
