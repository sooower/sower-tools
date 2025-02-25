import path from "node:path";

import { Project } from "ts-morph";

import { getWorkspaceFolderPath, isTypeScriptFile } from "@/utils/vscode";

import { fs, logger, vscode } from "..";

/**
 * TypeScript project, built by ts-morph.
 */
export let project: Project | undefined;

/**
 * Initialize project analyser when there is a TypeScript project opened in the workspace.
 */
export function initializeProjectAnalyser() {
    createProjectAnalyser();
    registerListeners();
}

function createProjectAnalyser() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        logger.trace("No workspace folder found, skipping project analysis.");
        project = undefined;

        return;
    }

    const tsConfigFilePath = path.join(workspaceFolderPath, "tsconfig.json");

    if (!fs.existsSync(tsConfigFilePath)) {
        logger.trace(
            `Skipped project analysis: ${tsConfigFilePath} not found.`
        );
        project = undefined;

        return;
    }

    project = new Project({ tsConfigFilePath });
}

/**
 * Register workspace events listeners for AST sync.
 */
function registerListeners() {
    vscode.workspace.onDidChangeWorkspaceFolders(e => {
        if ((vscode.workspace.workspaceFolders?.length ?? 0) !== 1) {
            logger.trace(
                "Not found or multiple workspace folders found, skipping project analysis."
            );
            project = undefined;

            return;
        }

        createProjectAnalyser();
    });

    vscode.workspace.onWillSaveTextDocument(async e => {
        if (!isTypeScriptFile(e.document)) {
            return;
        }

        await refreshSourceFileCache(e.document);
    });
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
            logger.trace(`[AST] added source file '${document.fileName}'.`);
        } else {
            sourceFile.replaceText(
                [0, sourceFile.getFullText().length],
                document.getText()
            );
            logger.trace(`[AST] refreshed file '${document.fileName}'.`);
        }
    } catch (error) {
        logger.error(
            `[AST] failed to refresh source file '${document.fileName}'.`,
            error
        );
    }
}
