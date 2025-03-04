import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { execCommand } from "@utils/command";

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

    const resRemoteRepos = await execCommand({
        command: `git remote -v`,
        cwd: workspaceFolderPath,
        interactive: false,
    });

    const remoteRepos: vscode.QuickPickItem[] = [];
    for (const line of resRemoteRepos?.trim().split("\n") ?? []) {
        const [name, url, type] = line.split(/\s+/);
        if (type === "(push)") {
            remoteRepos.push({
                label: name,
                description: url,
            });
        }
    }

    // Select a remote repository to push the branch to

    const selectedRemoteRepo = await vscode.window.showQuickPick(remoteRepos, {
        canPickMany: false,
        placeHolder: `Pick a remote repository to push the branch ${currBranch} to:`,
    });

    if (selectedRemoteRepo === undefined) {
        return;
    }

    const { label: upstreamName } = selectedRemoteRepo;
    const branchesDetails = await execCommand({
        command: `git fetch --all && git branch -vv`,
        cwd: workspaceFolderPath,
        interactive: false,
    });

    const branchDetails = branchesDetails
        ?.trim()
        .split("\n")
        .filter(it => new RegExp(`^(\\*\\s+)?${currBranch}\\s+`).test(it))
        .at(0);
    const remoteBranch = branchDetails?.slice(
        branchDetails.indexOf("[") + 1,
        branchDetails.indexOf("]")
    );

    // If the upstream branch is not found, set it and force push
    if (remoteBranch === undefined) {
        await setUpstreamBranchAndForcePush({
            currBranch,
            upstreamName,
            workspaceFolderPath,
        });

        return;
    }

    // Force push to the upstream branch
    await forcePush({
        currBranch,
        upstreamName,
        upstreamBranch: remoteBranch,
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
        `No upstream branch found, this will to set upstream branch "${upstreamName}/${currBranch}" for branch "${currBranch}" and force push to. Are you sure you want to continue?`,
        {
            modal: true,
            detail: `It will execute command "git push -f -u ${upstreamName} ${currBranch}" and not be able to rollback.`,
        },
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
    currBranch,
    upstreamName,
    upstreamBranch,
    workspaceFolderPath,
}: {
    currBranch: string;
    upstreamName: string;
    upstreamBranch: string;
    workspaceFolderPath: string;
}) {
    const kForcePush = "Force push";
    const confirm = await vscode.window.showWarningMessage(
        `This will force push branch "${currBranch}" to "${upstreamBranch}". Are you sure you want to continue?`,
        {
            modal: true,
            detail: `It will execute command "git push -f -u ${upstreamName}" and not be able to rollback.`,
        },
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
