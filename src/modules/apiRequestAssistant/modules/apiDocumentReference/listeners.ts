import path from "node:path";

import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import { debounce } from "@/utils/common";
import {
    getPossibleWorkspaceRelativePath,
    getWorkspaceFolderPath,
    isTypeScriptFile,
    setContext,
} from "@/utils/vscode";

import { apiDirRelativePath, enableApiDocumentReference } from "./configs";

const kDebounceDelay = 1000;

export let apiDocFilePath: string | undefined;

export function registerListeners() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(
            recheckContextIfShowReferToApiDocument
        ),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor === undefined) {
                return;
            }

            recheckContextIfShowReferToApiDocument(editor.document);
        }),
        vscode.workspace.onDidChangeTextDocument(async e => {
            await debounce(
                recheckContextIfShowReferToApiDocument,
                kDebounceDelay
            )(e.document);
        })
    );
    vscode.workspace.textDocuments
        .filter(it => isTypeScriptFile(it))
        .forEach(document => {
            recheckContextIfShowReferToApiDocument(document);
        });
}

async function recheckContextIfShowReferToApiDocument(
    document: vscode.TextDocument
) {
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
            getPossibleWorkspaceRelativePath(document)
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
        getPossibleWorkspaceRelativePath(document)
    );
    await setContext(
        `${extensionName}.referToApiDocument.ifShowReferToApiDocument`,
        true
    );
}
