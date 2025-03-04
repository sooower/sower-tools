import path from "node:path";

import {
    extensionCtx,
    extensionName,
    fs,
    logger,
    updateConfigurationItem,
    vscode,
} from "@/core";
import {
    getWorkspaceFolderPath,
    getWorkspaceRelativePath,
} from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import {
    enableEnvDocumentReference,
    envVariablesDirRelativePath,
    ignoreProjectNames,
    supportedProjectNames,
} from "./configs";
import { envFilename } from "./listeners";

export function registerCommandReferToEnvVariables() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.apiRequestAssistant.referToEnvVariables`,
            async () => {
                try {
                    const editor = vscode.window.activeTextEditor;
                    if (editor === undefined) {
                        return;
                    }

                    await showEnvVariablesReference(editor.document);
                } catch (e) {
                    logger.error("Failed to show env variables reference.", e);
                }
            }
        )
    );
}

async function showEnvVariablesReference(document: vscode.TextDocument) {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    if (!enableEnvDocumentReference) {
        return;
    }

    if (envFilename === undefined) {
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
            `The project name "${projectName}" is not supported to refer to env variables. Do you want to add it to the supported project list?`,
            kAddToSupport,
            kNeverShowItAgain
        );

        if (confirm === kAddToSupport) {
            await updateConfigurationItem(
                `${extensionName}.apiRequestAssistant.envVariablesReference.supportedProjectNames`,
                [...new Set([...supportedProjectNames, projectName])]
            );

            return;
        }

        if (confirm === kNeverShowItAgain) {
            await updateConfigurationItem(
                `${extensionName}.apiRequestAssistant.envVariablesReference.ignoreProjectNames`,
                [...new Set([...ignoreProjectNames, projectName])]
            );

            return;
        }
    }

    // Find the project env file path according to the current file path

    const relPathSegments = getWorkspaceRelativePath(document)
        .split(path.sep)
        .filter(it => it !== "");
    const envDirNames = await fs.promises.readdir(
        path.join(workspaceFolderPath, envVariablesDirRelativePath)
    );
    const intersectedDirNames = CommonUtils.setIntersection(
        new Set(relPathSegments),
        new Set(envDirNames)
    );
    CommonUtils.assert(
        intersectedDirNames.size === 1,
        `Cannot find the matched env document path, please check the env document path: ${envVariablesDirRelativePath}`
    );
    const [currentProjectName] = [...intersectedDirNames];
    const envFilePath = path.join(
        workspaceFolderPath,
        envVariablesDirRelativePath,
        currentProjectName,
        envFilename
    );
    if (!fs.existsSync(envFilePath)) {
        logger.warn(`The env document path "${envFilePath}" does not exist.`);

        return;
    }

    // Open the env document in the second view column or reveal the editor if it is already opened

    const visibleEditor = vscode.window.visibleTextEditors.find(
        it => it.document.fileName === envFilePath
    );
    if (visibleEditor !== undefined) {
        visibleEditor.revealRange(
            new vscode.Range(0, 0, 0, 0),
            vscode.TextEditorRevealType.InCenter
        );
    } else {
        await vscode.window.showTextDocument(
            await vscode.workspace.openTextDocument(envFilePath),
            {
                viewColumn: vscode.ViewColumn.Beside,
            }
        );
    }
}
