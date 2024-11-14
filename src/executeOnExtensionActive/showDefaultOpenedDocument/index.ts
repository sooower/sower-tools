import path from "node:path";

import { vscode } from "@/shared";
import { defaultOpenedDocumentNames } from "@/shared/init";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";

export async function showDefaultOpenedDocument() {
    if (vscode.workspace.workspaceFolders === undefined) {
        return;
    }

    if (vscode.window.activeTextEditor !== undefined) {
        return;
    }

    if (defaultOpenedDocumentNames.length === 0) {
        console.warn(`No default opened document found.`);

        return;
    }

    for (const docName of defaultOpenedDocumentNames) {
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
        } catch (e) {
            continue;
        }
    }
}
