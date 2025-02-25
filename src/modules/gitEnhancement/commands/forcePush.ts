import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";
import { CommonUtils } from "@utils/common";

export function registerCommandForcePush() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.gitEnhancement.forcePush`,
            async () => {
                await vscode.window.withProgress(
                    { location: vscode.ProgressLocation.SourceControl },
                    async (progress, token) => {
                        try {
                            await doGitForcePush();
                        } catch (e) {
                            logger.error(`Failed to force push.`, e);
                        }
                    }
                );
            }
        )
    );
}

async function doGitForcePush() {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    // Get current branch and remote repositories

    const currBranch = await execCommand({
        command: `git branch --show-current`,
        cwd: workspaceFolderPath,
        interactive: false,
    });
    if (currBranch === undefined) {
        logger.error(`No current branch found.`);

        return;
    }

    const res = await execCommand({
        command: `git remote -v`,
        cwd: workspaceFolderPath,
        interactive: false,
    });

    const remoteRepositories: vscode.QuickPickItem[] = [];
    for (const line of res?.trim().split("\n") ?? []) {
        const [name, url, type] = line.split(/\s+/);
        if (type === "(push)") {
            remoteRepositories.push({
                label: name,
                description: url,
            });
        }
    }

    // Select a remote repository to push the branch to

    const selectedRemoteRepository = await vscode.window.showQuickPick(
        remoteRepositories,
        {
            canPickMany: false,
            placeHolder: `Pick a remote repository to push the branch ${currBranch} to:`,
        }
    );

    if (selectedRemoteRepository === undefined) {
        return;
    }

    const { label: upstreamName } = selectedRemoteRepository;
    let upstreamBranch: string | undefined;
    try {
        upstreamBranch = await execCommand({
            command: `git rev-parse --abbrev-ref ${currBranch}@{upstream}`,
            cwd: workspaceFolderPath,
            interactive: false,
        });
    } catch (e) {
        if (CommonUtils.assertString(e).includes("unknown revision")) {
            // If the upstream branch is not found, set it and force push
            await setUpstreamBranchAndForcePush({
                currBranch,
                upstreamName,
                workspaceFolderPath,
            });

            return;
        }

        logger.error(
            `Failed to get upstream branch for branch "${currBranch}".`,
            e
        );

        return;
    }

    // Force push to the upstream branch
    await forcePush({
        upstreamName,
        upstreamBranch: CommonUtils.mandatory(upstreamBranch),
        workspaceFolderPath,
    });
}

async function setUpstreamBranchAndForcePush({
    currBranch,
    upstreamName,
    workspaceFolderPath,
}: {
    currBranch: string;
    upstreamName: string;
    workspaceFolderPath: string;
}) {
    const kSetUpstreamBranch = "Set upstream branch and force push";

    const confirm = await vscode.window.showWarningMessage(
        `No upstream branch found for branch "${currBranch}". Are you want to set upstream branch "${upstreamName}/${currBranch}" and force push to?`,
        { modal: true },
        kSetUpstreamBranch
    );

    if (confirm !== kSetUpstreamBranch) {
        return;
    }

    await execCommand({
        command: `git push -f -u ${upstreamName} ${currBranch}`,
        cwd: workspaceFolderPath,
        interactive: false,
    });

    logger.info(
        `Set upstream branch "${upstreamName}/${currBranch}" and force push successfully.`
    );
}

async function forcePush({
    upstreamName,
    upstreamBranch,
    workspaceFolderPath,
}: {
    upstreamName: string;
    upstreamBranch: string;
    workspaceFolderPath: string;
}) {
    const kForcePush = "Force push";
    const confirm = await vscode.window.showWarningMessage(
        `This will override the remote branch "${upstreamBranch}" and not be able to rollback. Are you sure you want to force push to?`,
        { modal: true },
        kForcePush
    );

    if (confirm !== kForcePush) {
        return;
    }

    await execCommand({
        command: `git push -f -u ${upstreamName}`,
        cwd: workspaceFolderPath,
        interactive: false,
    });

    logger.info(`Force push successfully.`);
}
