import path from "node:path";

import { Node } from "ts-morph";

import {
    extensionCtx,
    extensionName,
    fs,
    logger,
    project,
    updateConfigurationItem,
    vscode,
} from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import {
    envVariablesDirRelativePath,
    ignoreProjectNames,
    supportedProjectNames,
} from "./configs";

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

    const envFilename = findEnvFilename(document.uri.fsPath);
    if (envFilename === undefined) {
        return;
    }

    const relPath = path.relative(workspaceFolderPath, document.uri.fsPath);
    const relPathSegments = relPath.split(path.sep).filter(it => it !== "");
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
        it => it.document.uri.fsPath === envFilePath
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

/**
 * Find the `envFilename` property value in the `Env` class declaration
 * according to the given file path and the import statement of `env` type.
 *
 * @example
 * - The import statement of `env` type in current file is as follows:
 * ```typescript
 * import { env } from "xx/xx/env";
 * ```
 * - The `env` variable is a instance of `Env` class.
 * ```ts
 * const env = new Env()
 * ```
 * - The `Env` class is as follows:
 * ```ts
 * class Env extends EnvVariables {
 *     constructor() {
 *         super({
 *             projectName: path.basename(__dirname),
 *             envFileName: "localhost:18020.jsonc",
 *         });
 *     }
 * }
 * ```
 * so the found value of `envFilename` is 'localhost:18020.jsonc'.
 *
 * @param filePath - The file path to get the env filename from
 * @returns The env filename
 */
function findEnvFilename(filePath: string) {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const envImportStmt = project
        ?.getSourceFile(filePath)
        ?.getImportDeclaration(imp =>
            imp.getNamedImports().some(spec => spec.getName() === "env")
        );
    if (envImportStmt === undefined) {
        logger.info(
            `No variable "env" used in current file: "${path.relative(
                workspaceFolderPath,
                filePath
            )}".`
        );

        return;
    }

    const envDeclarations =
        envImportStmt
            .getImportClause()
            ?.getNamedImports()
            .find(spec => spec.getName() === "env")
            ?.getType()
            .getSymbol()
            ?.getDeclarations() ?? [];

    const envClassDeclaration = envDeclarations
        .filter(it => Node.isClassDeclaration(it))
        .at(0);

    const envClassFilePath = path.relative(
        workspaceFolderPath,
        CommonUtils.mandatory(
            envDeclarations.at(0)?.getSourceFile().getFilePath()
        )
    );

    if (envClassDeclaration === undefined) {
        logger.error(
            `No class declaration found for variable "env" in file "${envClassFilePath}".`
        );

        return;
    }

    let envFilename: string | undefined;

    const envClassName = envClassDeclaration.getName();
    const firstCtorDeclaration = envClassDeclaration.getConstructors().at(0);
    firstCtorDeclaration
        ?.getBody()
        ?.getDescendants()
        .filter(it => Node.isExpressionStatement(it))
        .forEach(node => {
            // Get 'envFilename' property from super call

            // Get 'envFilename' property from super call
            const expr = node.getExpression();
            if (
                Node.isCallExpression(expr) &&
                expr.getExpression().getText() === "super"
            ) {
                // Get 'envFilename' property from object literal parameter
                const superCallExprArgs = expr.getArguments();
                superCallExprArgs.forEach(arg => {
                    if (Node.isObjectLiteralExpression(arg)) {
                        arg.getProperties().forEach(prop => {
                            if (
                                Node.isPropertyAssignment(prop) &&
                                prop.getName() === "envFileName"
                            ) {
                                const initializer = prop.getInitializer();
                                if (!Node.isStringLiteral(initializer)) {
                                    logger.trace(
                                        `The "envFileName" property of class "${envClassName}" is not a string literal, file: "${envClassFilePath}".`
                                    );

                                    return;
                                }

                                envFilename = initializer.getLiteralText();
                            }
                        });
                    }
                });
            }
        });

    if (envFilename === undefined) {
        logger.warn(
            `No "envFileName" property found in the class "${envClassName}" in file "${envClassFilePath}".`
        );

        return;
    }

    return envFilename;
}
