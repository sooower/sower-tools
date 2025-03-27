import { Node } from "ts-morph";

import { extensionCtx, extensionName, logger, project, vscode } from "@/core";
import {
    getPossibleWorkspaceRelativePath,
    getWorkspaceFolderPath,
    isTypeScriptFile,
    setContext,
} from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { enableEnvDocumentReference } from "./configs";

export let envFilename: string | undefined;

export function registerListeners() {
    extensionCtx.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(referToEnvVariables),
        vscode.window.onDidChangeActiveTextEditor(editor => {
            if (editor === undefined) {
                return;
            }

            referToEnvVariables(editor.document);
        })
    );
    vscode.workspace.textDocuments
        .filter(it => isTypeScriptFile(it))
        .forEach(document => {
            referToEnvVariables(document);
        });
}

async function referToEnvVariables(document: vscode.TextDocument) {
    if (!isTypeScriptFile(document)) {
        return;
    }

    if (!enableEnvDocumentReference) {
        return;
    }

    envFilename = findEnvFilename(document.fileName);
    if (envFilename === undefined) {
        logger.trace(
            `Not found envFilename in file: "%s".`,
            getPossibleWorkspaceRelativePath(document)
        );
        await setContext(
            `${extensionName}.referToEnvVariables.ifShowReferToEnvVariables`,
            false
        );

        return;
    }

    logger.trace(
        `Found envFilename "%s" in file: "%s".`,
        envFilename,
        getPossibleWorkspaceRelativePath(document)
    );
    await setContext(
        `${extensionName}.referToEnvVariables.ifShowReferToEnvVariables`,
        true
    );
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

    const envClassFilePath = getPossibleWorkspaceRelativePath(
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
        .forEach(it => {
            // Get 'envFilename' property from super call
            const expr = it.getExpression();
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
