import path from "node:path";

import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import {
    getWorkspaceFolderPath,
    getWorkspaceRelativePath,
    isTypeScriptFile,
    setContext,
} from "@/utils/vscode";

import { apiDirRelativePath, enableApiDocumentReference } from "./configs";

export let apiDocFilePath: string | undefined;

export function registerListeners() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(referToApiDocument),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor === undefined) {
                return;
            }

            referToApiDocument(editor.document);
        })
    );
    vscode.workspace.textDocuments
        .filter(it => isTypeScriptFile(it))
        .forEach(document => {
            referToApiDocument(document);
        });
}

async function referToApiDocument(document: vscode.TextDocument) {
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableApiDocumentReference) {
        return;
    }

    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const relPath = path.relative(
        path.join(workspaceFolderPath, "src"),
        path.dirname(document.fileName)
    );
    apiDocFilePath = `${path.resolve(
        workspaceFolderPath,
        apiDirRelativePath,
        relPath
    )}.md`;

    if (!fs.existsSync(apiDocFilePath)) {
        logger.trace(
            `Not found api doc file with request file: "%s".`,
            getWorkspaceRelativePath(document)
        );
        await setContext(
            `${extensionName}.referToApiDocument.ifShowReferToApiDocument`,
            false
        );

        return;
    }

    logger.trace(
        `Found api doc file "%s" with request file: "%s".`,
        apiDocFilePath,
        getWorkspaceRelativePath(document)
    );
    await setContext(
        `${extensionName}.referToApiDocument.ifShowReferToApiDocument`,
        true
    );
}
