import path from "node:path";

import { vscode } from "../shared";
import { extensionName, getConfigurationItem } from "../shared/init";
import CommonUtils from "../shared/utils/commonUtils";

export async function subscribeShowDefaultOpenedDocument() {
    if (vscode.workspace.workspaceFolders === undefined) {
        // Do not show document when no workspace is open
        return;
    }

    if (vscode.window.activeTextEditor !== undefined) {
        // Do not show default opened document since has one opened
        return;
    }

    const defaultOpenedDocumentNames = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.ShowDefaultOpenedDocument.documentNames`
        )
    ).map((it) => CommonUtils.assertString(it));

    const [workspaceFolder] = vscode.workspace.workspaceFolders;
    for (const docName of defaultOpenedDocumentNames) {
        try {
            const doc = await vscode.workspace.openTextDocument(
                path.join(workspaceFolder.uri.path, docName)
            );
            await vscode.window.showTextDocument(doc, {
                preview: true,
                viewColumn: vscode.ViewColumn.One,
            });
            await vscode.commands.executeCommand(
                "markdown-preview-enhanced.openPreview",
                vscode.Uri.file(path.join(workspaceFolder.uri.path, docName))
            );

            return;
        } catch (e) {
            continue;
        }
    }

    console.warn(`No default opened document found.`);
}
