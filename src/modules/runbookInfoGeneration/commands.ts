import path from "node:path";

import { Node, Project } from "ts-morph";
import z from "zod";

import {
    extensionCtx,
    extensionName,
    format,
    fs,
    logger,
    vscode,
} from "@/core";
import { execCmd } from "@/utils/common";
import { renderTemplateFile } from "@/utils/template";
import { CommonUtils } from "@utils/common";
import { nowDate } from "@utils/datetime";
import { readJsonFile } from "@utils/fs";

import {
    enableGenerateRunbookInfo,
    envRelativeFilePaths,
    migrationDirNames,
    projects,
    runbookDirPath,
} from "./configs";

type TProjectGenerationDetail = {
    serviceName: string;
    status: "skipped" | "ok";
};

export function registerCommandGenerateRunbookInfo() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.runbookInfoGeneration.generateRunbookInfo`,
            async () => {
                const kAddProjects = "addProjects";
                const quickPick = vscode.window.createQuickPick();
                quickPick.items = projects.map(
                    ({ serviceName, projectPath }) => ({
                        label: serviceName,
                        description: projectPath,
                    })
                );
                quickPick.canSelectMany = true;
                quickPick.placeholder =
                    "Select projects to generate runbook info";
                quickPick.buttons = [
                    {
                        iconPath: new vscode.ThemeIcon("add"),
                        tooltip: kAddProjects,
                    },
                ];
                quickPick.show();
                quickPick.onDidTriggerButton(async ({ tooltip }) => {
                    try {
                        if (tooltip === kAddProjects) {
                            await vscode.commands.executeCommand(
                                "workbench.action.openSettings",
                                `${extensionName}.runbookInfoGeneration.projects`
                            );
                        }
                    } catch (e) {
                        logger.error(
                            `Failed to update runbook info generation projects.`,
                            e
                        );
                    }
                });

                const projectsGenerationDetails: TProjectGenerationDetail[] =
                    [];

                quickPick.onDidAccept(async () => {
                    if (!enableGenerateRunbookInfo) {
                        logger.info(
                            "Runbook info generation is disabled, update the corresponding configuration to enable it."
                        );

                        return;
                    }

                    quickPick.hide();
                    logger.channel.show();

                    await vscode.window.withProgress(
                        {
                            location: vscode.ProgressLocation.Notification,
                            cancellable: true,
                        },
                        async (progress, token) => {
                            await generateRunbookInfo(
                                [...quickPick.selectedItems],
                                progress,
                                token,
                                projectsGenerationDetails
                            );
                        }
                    );
                    logger.info(
                        format(
                            `Generation completed. %s generated, %s skipped.`,
                            projectsGenerationDetails.filter(
                                it => it.status === "ok"
                            ).length,
                            projectsGenerationDetails.filter(
                                it => it.status === "skipped"
                            ).length
                        ),
                        format(
                            `Details:\n%s`,
                            projectsGenerationDetails
                                .map(it => `- [${it.status}] ${it.serviceName}`)
                                .join("\n")
                        )
                    );
                });
            }
        )
    );
}

export const versionSchema = z.object({
    major: z.string(),
    minor: z.string(),
    fix: z.string(),
    build: z.number(),
    commit: z.string(),
});

export type TVersion = z.infer<typeof versionSchema>;

async function generateRunbookInfo(
    selectedProjects: vscode.QuickPickItem[],
    progress: vscode.Progress<{ increment?: number; message?: string }>,
    token: vscode.CancellationToken,
    projectsGenerationDetails: TProjectGenerationDetail[]
) {
    try {
        const projectsMap = new Map<
            string,
            {
                projectPath: string;
                serviceName: string;
                envPrefix: string;
            }
        >();
        projects.forEach(it => {
            projectsMap.set(it.serviceName, it);
        });

        let handledProjectCount = 0;
        for (const { label } of selectedProjects) {
            // Update progress
            progress.report({
                message: format(
                    `[%d/%d] Generating runbook for project "%s".`,
                    ++handledProjectCount,
                    selectedProjects.length,
                    label
                ),
            });

            const { projectPath, serviceName, envPrefix } =
                CommonUtils.mandatory(projectsMap.get(label));

            try {
                if (token.isCancellationRequested) {
                    break;
                }

                // Skip if runbook already exists
                const runbookFilePath = path.join(
                    runbookDirPath,
                    `${nowDate()}/${serviceName}`
                );
                if (fs.existsSync(runbookFilePath)) {
                    logger.warn(
                        `Runbook "${runbookFilePath}" already exists, skipped to generate it.`
                    );
                    projectsGenerationDetails.push({
                        serviceName,
                        status: "skipped",
                    });

                    continue;
                }

                // Build new version branch details

                const branches = ["main", "master"];
                const branch = await findBranch(branches, projectPath);
                CommonUtils.assert(
                    branch !== undefined,
                    format(
                        `Cannot find any of branches "%s" in project "%s".`,
                        branches.join(", "),
                        projectPath
                    )
                );

                const currentBranch = await execCmd({
                    command: `git rev-parse --abbrev-ref HEAD`,
                    cwd: projectPath,
                    interactive: false,
                });

                await execCmd({
                    command: `git checkout ${branch} && git pull`,
                    cwd: projectPath,
                    interactive: true,
                });
                await execCmd({
                    command: `npm run build`,
                    cwd: projectPath,
                    interactive: true,
                });

                const appInfoFilePath = path.join(
                    projectPath,
                    "dist/.appinfo.json"
                );

                const newVersion = versionSchema.parse(
                    readJsonFile(appInfoFilePath)
                );

                // Build current version branch details

                await execCmd({
                    command: `git reset --hard HEAD^`,
                    cwd: projectPath,
                    interactive: true,
                });
                await execCmd({
                    command: `npm run build`,
                    cwd: projectPath,
                    interactive: true,
                });
                const currentVersion = versionSchema.parse(
                    readJsonFile(appInfoFilePath)
                );

                // Build 'Database Migration' info if exists

                // Compatibility with legacy migration directory name
                let migrationDirName: string | undefined;
                for (const dirName of migrationDirNames) {
                    if (fs.existsSync(path.join(projectPath, dirName))) {
                        migrationDirName = dirName;

                        break;
                    }
                }
                CommonUtils.assert(
                    migrationDirName !== undefined,
                    format(
                        `Cannot find any of directories "%s" in project "%s".`,
                        migrationDirNames.join(", "),
                        projectPath
                    )
                );

                const migrationFiles = await execCmd({
                    command: `git diff --name-only ${currentVersion.commit} ${newVersion.commit} -- ${migrationDirName}`,
                    cwd: projectPath,
                    interactive: false,
                });

                // Build 'Update Env' info if exists

                let envRelativeFilePath: string | undefined;
                for (const filePath of envRelativeFilePaths) {
                    if (fs.existsSync(path.join(projectPath, filePath))) {
                        envRelativeFilePath = filePath;

                        break;
                    }
                }
                CommonUtils.assert(
                    envRelativeFilePath !== undefined,
                    format(
                        `Cannot find any of files "%s" in project "%s".`,
                        envRelativeFilePaths.join(", "),
                        projectPath
                    )
                );

                const lineRanges = await getDiffLineRanges({
                    projectPath,
                    currentCommitId: currentVersion.commit,
                    newCommitId: newVersion.commit,
                    envRelativeFilePath,
                });

                const addedEnvKeys = await extractAddedEnvKeys({
                    projectPath,
                    newCommitId: newVersion.commit,
                    envRelativeFilePath,
                    lineRanges,
                });

                // Render runbook info

                await renderRunbookInfo({
                    serviceName,
                    branch,
                    newVersion,
                    currentVersion,
                    migrationFiles: migrationFiles?.split("\n") ?? [],
                    addedEnvKeys: addedEnvKeys.map(
                        key => `${envPrefix}${key}=`
                    ),
                });

                await execCmd({
                    command: `git checkout ${currentBranch}`,
                    cwd: projectPath,
                    interactive: true,
                });

                projectsGenerationDetails.push({
                    serviceName,
                    status: "ok",
                });
            } catch (e) {
                logger.warn(
                    `Skipped to generate runbook for project "${serviceName}".`,
                    e
                );
            }
        }
    } catch (e) {
        logger.error("Failed to generate book info.", e);
    }
}

async function findBranch(branches: string[], projectPath: string) {
    for (const branch of branches) {
        const branchExists = await execCmd({
            command: `git show-ref --verify --quiet refs/heads/${branch} && echo 0 || echo 1`,
            cwd: projectPath,
            interactive: false,
        });

        if (branchExists?.toString().trim() === "0") {
            return branch;
        }
    }
}

type TRenderRunbookInfoOptions = {
    serviceName: string;
    branch: string;
    newVersion: TVersion;
    currentVersion: TVersion;
    migrationFiles: string[];
    addedEnvKeys: string[];
};

async function renderRunbookInfo({
    serviceName,
    branch,
    newVersion,
    currentVersion,
    migrationFiles = [],
    addedEnvKeys = [],
}: TRenderRunbookInfoOptions) {
    const runbookFilePath = path.join(
        runbookDirPath,
        `${nowDate()}/${serviceName}`
    );
    await renderTemplateFile({
        templateFilePath: path.join(
            extensionCtx.extensionPath,
            "templates/runbookInfoGeneration/runbook.hbs"
        ),
        outputFilePath: runbookFilePath,
        data: {
            serviceName,
            newVersion: {
                branch,
                version: format(
                    `%s.%s.%s.%d`,
                    newVersion.major,
                    newVersion.minor,
                    newVersion.fix,
                    newVersion.build
                ),
                commitId: newVersion.commit,
            },
            currentVersion: {
                branch,
                version: format(
                    `%s.%s.%s.%d`,
                    currentVersion.major,
                    currentVersion.minor,
                    currentVersion.fix,
                    currentVersion.build
                ),
                commitId: currentVersion.commit,
            },
            migrationFiles,
            addedEnvKeys,
        },
    });

    await vscode.window.showTextDocument(vscode.Uri.file(runbookFilePath));
    logger.info(`Saved runbook info file "${runbookFilePath}".`);
}

type TGetDiffLineRangesOptions = {
    projectPath: string;
    currentCommitId: string;
    newCommitId: string;
    envRelativeFilePath: string;
};

async function getDiffLineRanges({
    projectPath,
    currentCommitId,
    newCommitId,
    envRelativeFilePath,
}: TGetDiffLineRangesOptions) {
    const diffOutput = await execCmd({
        command: `git diff -U0 ${currentCommitId} ${newCommitId} -- ${envRelativeFilePath}`,
        cwd: projectPath,
        interactive: false,
    });
    const lineRanges: number[][] = [];

    diffOutput?.split("\n").forEach(line => {
        if (line.startsWith("@@")) {
            const newRangeMatch = line.match(/\+(\d+)(,(\d+))?/);
            if (newRangeMatch !== null) {
                const [, start, , length = "1"] = newRangeMatch;
                lineRanges.push([
                    parseInt(start),
                    parseInt(start) + parseInt(length) - 1,
                ]);
            }
        }
    });

    return lineRanges;
}

type TExtractAddedEnvKeysOptions = {
    projectPath: string;
    newCommitId: string;
    envRelativeFilePath: string;
    lineRanges: number[][];
};

async function extractAddedEnvKeys({
    projectPath,
    newCommitId,
    envRelativeFilePath,
    lineRanges,
}: TExtractAddedEnvKeysOptions) {
    const fileContent = await execCmd({
        command: `git show ${newCommitId}:${envRelativeFilePath}`,
        cwd: projectPath,
        interactive: false,
    });
    const sourceFile = new Project().createSourceFile(
        path.resolve(projectPath, envRelativeFilePath),
        fileContent ?? "",
        {
            overwrite: true,
        }
    );

    const envKeys = new Set<string>();

    sourceFile
        .getDescendants()
        .filter(it => Node.isCallExpression(it))
        .forEach(callExpr => {
            if (callExpr.getExpression().getText() !== "envParser.parse") {
                return;
            }

            const startLine = callExpr.getStartLineNumber();
            const isInRange = lineRanges.some(
                ([start, end]) => startLine >= start && startLine <= end
            );
            if (!isInRange) {
                return;
            }

            const firstParam = callExpr.getArguments().at(0);
            if (firstParam === undefined) {
                logger.warn(
                    `No argument found for envParser.parse at line ${startLine}.`
                );

                return;
            }

            // Add the first param of 'envParser.parse' to the set
            if (Node.isStringLiteral(firstParam)) {
                envKeys.add(firstParam.getLiteralValue());
            }
        });

    return [...envKeys];
}
