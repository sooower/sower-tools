import path from "node:path";

import {
    extensionCtx,
    extensionName,
    logger,
    updateConfigurationItem,
    vscode,
} from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";

import {
    enableApiDocumentReference,
    ignoreProjectNames,
    supportedProjectNames,
} from "./configs";
import { apiDocFilePath } from "./listeners";

export function registerCommandReferToApiDocument() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.apiRequestAssistant.referToApiDocument`,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    await showApiDocumentReference(editor.document);
                } catch (e) {
                    logger.error("Failed to show api document reference.", e);
                }
            }
        )
    );
}

async function showApiDocumentReference(document: vscode.TextDocument) {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    if (!enableApiDocumentReference) {
        return;
    }

    if (apiDocFilePath === undefined) {
        return;
    }

    // Add to supported project list or ignore it if the project is not in a supported project

    const projectName = path.basename(workspaceFolderPath);
    if (
        !supportedProjectNames.includes(projectName) &&
        !ignoreProjectNames.includes(projectName)
    ) {
        const kAddToSupport = "Add to support";
        const kNeverShowItAgain = "Never show it again";
        const confirm = await vscode.window.showWarningMessage(
            `The project name "${projectName}" is not supported to refer to api document. Do you want to add it to the supported project list?`,
            kAddToSupport,
            kNeverShowItAgain
        );

        if (confirm === kAddToSupport) {
            await updateConfigurationItem(
                `${extensionName}.apiRequestAssistant.apiDocumentReference.supportedProjectNames`,
                [...new Set([...supportedProjectNames, projectName])]
            );

            return;
        }

        if (confirm === kNeverShowItAgain) {
            await updateConfigurationItem(
                `${extensionName}.apiRequestAssistant.apiDocumentReference.ignoreProjectNames`,
                [...new Set([...ignoreProjectNames, projectName])]
            );

            return;
        }
    }

    // Show the api document or reveal the editor if it is already opened

    const visibleEditor = vscode.window.visibleTextEditors.find(
        it => it.document.fileName === apiDocFilePath
    );
    if (visibleEditor !== undefined) {
        visibleEditor.revealRange(
            new vscode.Range(0, 0, 0, 0),
            vscode.TextEditorRevealType.InCenter
        );
    } else {
        await vscode.window.showTextDocument(
            await vscode.workspace.openTextDocument(apiDocFilePath)
        );
    }
}
