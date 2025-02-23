import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import { CommonUtils } from "@utils/common";

import { projectsOpenGroups } from "./configs";

export function registerCommandOpenProjects() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.projectEnhancement.openProjects`,
            async () => {
                try {
                    await openProjects();
                } catch (e) {
                    logger.error("Failed to open projects.", e);
                }
            }
        )
    );
}

async function openProjects() {
    const groupOptions: vscode.QuickPickItem[] = projectsOpenGroups.map(
        ({ name, projects }) => ({
            label: name,
            description: `(${projects.length} projects)`,
        })
    );

    if (groupOptions.length === 0) {
        // Open configuration settings to add groups.

        const kOpenConfigurations = "Open Configurations";
        vscode.window
            .showInformationMessage(
                "No groups found, open the configurations to add groups?",
                {
                    title: kOpenConfigurations,
                } satisfies vscode.MessageItem
            )
            .then(selected => {
                if (selected?.title === kOpenConfigurations) {
                    vscode.commands.executeCommand(
                        "workbench.action.openSettings",
                        `${extensionName}.projectsOpen.groups`
                    );
                }
            });

        return;
    }

    // Select one group of projects.

    const selectedGroup = await vscode.window.showQuickPick(groupOptions, {
        canPickMany: false,
        placeHolder: "[1/2] Select one group of projects",
    });
    if (selectedGroup === undefined) {
        return;
    }

    // Select projects in the group.

    const projectOptions: vscode.QuickPickItem[] =
        projectsOpenGroups
            .find(it => it.name === selectedGroup.label)
            ?.projects.map(({ name, fsPath }) => ({
                label: name,
                description: fsPath,
            })) ?? [];
    const selectedProjects = await vscode.window.showQuickPick(projectOptions, {
        canPickMany: true,
        placeHolder: "[2/2] Select projects to open",
    });
    if (selectedProjects === undefined) {
        return;
    }

    // Open projects.

    await Promise.all(
        selectedProjects.map(async ({ label: name, description: fsPath }) => {
            try {
                CommonUtils.assert(
                    fsPath !== undefined,
                    `Description of project "${name}" is undefined.`
                );
                CommonUtils.assert(
                    fs.existsSync(fsPath),
                    `Folder "${fsPath}" does not exist.`
                );

                vscode.commands.executeCommand(
                    "vscode.openFolder",
                    vscode.Uri.file(fsPath),
                    true
                );
            } catch (e) {
                logger.error(`Failed to open project "${name}".`, e);
            }
        })
    );
}
