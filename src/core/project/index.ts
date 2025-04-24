import path from "node:path";

import { Project } from "ts-morph";

import {
    enableShowAddedASTProjectSourceFiles,
    refreshSourceFileCacheDelay,
} from "@/modules/shared/modules/configuration/configs";

import { debounce } from "@/utils/common";
import {
    getPossibleWorkspaceRelativePath,
    getWorkspaceFolderPath,
    isTypeScriptFile,
} from "@/utils/vscode";

import { fs, logger, vscode } from "..";

/**
 * TypeScript project, built by ts-morph.
 */
export let project: Project | undefined;

/**
 * Initialize AST project when there is a TypeScript project opened in the workspace.
 */
export function initializeASTProject() {
    createASTProject();
    registerListeners();
}

function createASTProject() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        logger.trace(
            "[AST] no workspace folder found, skipping project creation."
        );
        project = undefined;

        return;
    }

    const tsConfigFilePath = path.join(workspaceFolderPath, "tsconfig.json");

    if (!fs.existsSync(tsConfigFilePath)) {
        logger.trace(
            `[AST] skipped project creation: ${tsConfigFilePath} not found.`
        );
        project = undefined;

        return;
    }

    // Create project

    project = new Project({
        tsConfigFilePath,
    });
    logger.trace("[AST] project created.");
    const sourceFilePaths = project
        .getSourceFiles()
        .map(it => getPossibleWorkspaceRelativePath(it.getFilePath()));
    logger.trace("[AST] created %d source files.", sourceFilePaths.length);

    // Show added AST project source files if necessary

    if (enableShowAddedASTProjectSourceFiles) {
        logger.trace("[AST] source files details:");
        sourceFilePaths.forEach((it, index) => {
            logger.trace("[AST] %d %s.", index + 1, it);
        });
    }
}

/**
 * Register workspace events listeners for AST sync.
 */
function registerListeners() {
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
        if ((vscode.workspace.workspaceFolders?.length ?? 0) !== 1) {
            logger.trace(
                "[AST] no workspace folder or multiple workspace folders found, skipping project creation."
            );
            project = undefined;

            return;
        }

        createASTProject();
    });

    vscode.workspace.textDocuments.forEach(document => {
        if (!isTypeScriptFile(document)) {
            return;
        }

        debouncedRefreshSourceFileCache(document);
    });

    vscode.workspace.onDidChangeTextDocument(e => {
        if (!isTypeScriptFile(e.document)) {
            return;
        }

        debouncedRefreshSourceFileCache(e.document);
    });
}

async function debouncedRefreshSourceFileCache(document: vscode.TextDocument) {
    await debounce(
        refreshSourceFileCache,
        refreshSourceFileCacheDelay
    )(document);
}

async function refreshSourceFileCache(document: vscode.TextDocument) {
    try {
        if (project === undefined) {
            return;
        }

        const sourceFile = project.getSourceFile(document.fileName);
        if (sourceFile === undefined) {
            project.createSourceFile(document.fileName, document.getText(), {
                overwrite: true,
            });
            logger.trace(
                `[AST] added source file "${getPossibleWorkspaceRelativePath(
                    document
                )}"`
            );
        } else {
            sourceFile.replaceText(
                [0, sourceFile.getFullText().length],
                document.getText()
            );
            logger.trace(
                `[AST] refreshed file "${getPossibleWorkspaceRelativePath(
                    document
                )}"`
            );
        }
    } catch (error) {
        logger.error(
            `[AST] failed to refresh source file "${getPossibleWorkspaceRelativePath(
                document
            )}".`,
            error
        );
    }
}
