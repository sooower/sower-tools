import path from "node:path";

import { logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";

import { readmeDocumentNames } from "./configs";

export async function previewDocument() {
    if (vscode.workspace.workspaceFolders === undefined) {
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
        try {
            const doc = await vscode.workspace.openTextDocument(
                path.join(getWorkspaceFolderPath(), docName)
            );
            await vscode.window.showTextDocument(doc, {
                preview: true,
                viewColumn: vscode.ViewColumn.One,
            });
            await vscode.commands.executeCommand(
                "markdown-preview-enhanced.openPreview",
                vscode.Uri.file(path.join(getWorkspaceFolderPath(), docName))
            );

            return;
        } catch (_e) {
            continue;
        }
    }
}
