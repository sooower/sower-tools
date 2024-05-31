import path from "node:path";

import { commands, Uri, ViewColumn, window, workspace } from "vscode";

import { extensionName, getConfigurationItem } from "../shared";
import CommonUtils from "../shared/utils/commonUtils";

export async function subscribeShowDefaultOpenedDocument() {
    if (workspace.workspaceFolders === undefined) {
        // Do not show document when no workspace is open
        return;
    }

    const defaultOpenedDocumentNames = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.ShowDefaultOpenedDocument.documentNames`
        )
    ).map((it) => CommonUtils.assertString(it));

    const [workspaceFolder] = workspace.workspaceFolders;
    for (const docName of defaultOpenedDocumentNames) {
        try {
            const doc = await workspace.openTextDocument(
                path.join(workspaceFolder.uri.path, docName)
            );
            await window.showTextDocument(doc, {
                preview: true,
                viewColumn: ViewColumn.One,
            });
            await commands.executeCommand(
                "markdown-preview-enhanced.openPreview",
                Uri.file(path.join(workspaceFolder.uri.path, docName))
            );

            return;
        } catch (e) {
            continue;
        }
    }

    console.warn(`No default opened document found.`);
}
