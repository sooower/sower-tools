import path from "node:path";

import { QuickInputButton } from "vscode";

import {
    extensionCtx,
    extensionName,
    fs,
    logger,
    updateConfigurationItem,
    vscode,
} from "@/core";
import { formatHomeDirAlias } from "@/utils/common";
import { CommonUtils } from "@utils/common";

import {
    EProjectDisplayStyle,
    projectDisplayStyle,
    projectsOpenGroups,
} from "./configs";

enum EQuickPickButton {
    ShowInGroupsStyle = "Show in groups style",
    ShowInFlatStyle = "Show in flat style",
    AddGroups = "Add groups",
}

export function registerCommandOpenProjects() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.projectEnhancement.openProjects`,
            async () => {
                try {
                    switch (projectDisplayStyle) {
                        case EProjectDisplayStyle.Groups: {
                            await openProjectsInGroupsStyle();

                            break;
                        }
                        case EProjectDisplayStyle.Flat: {
                            await openProjectsInFlatStyle();

                            break;
                        }
                        default: {
                            throw new Error(
                                `Unexpected project display style "${projectDisplayStyle}".`
                            );
                        }
                    }
                } catch (e) {
                    logger.error("Failed to open projects.", e);
                }
            }
        )
    );
}

async function openProjectsInGroupsStyle() {
    const groupOptions: vscode.QuickPickItem[] = projectsOpenGroups.map(
        ({ name, projects }) => ({
            label: name,
            description: `(${projects.length} projects)`,
        })
    );

    // Select one group of projects

    const quickPickButtons: QuickInputButton[] = [
        {
            iconPath: new vscode.ThemeIcon("expand-all"),
            tooltip: EQuickPickButton.ShowInFlatStyle,
        },
        {
            iconPath: new vscode.ThemeIcon("add"),
            tooltip: EQuickPickButton.AddGroups,
        },
    ];

    const groupsQuickPick = vscode.window.createQuickPick();
    groupsQuickPick.items = groupOptions;
    groupsQuickPick.canSelectMany = false;
    groupsQuickPick.placeholder = "[1/2] Select group of projects to open";
    groupsQuickPick.buttons = quickPickButtons;
    groupsQuickPick.show();
    groupsQuickPick.onDidTriggerButton(async ({ tooltip }) => {
        switch (tooltip) {
            case EQuickPickButton.ShowInFlatStyle: {
                await updateConfigurationItem(
                    `${extensionName}.projectsOpen.style`,
                    EProjectDisplayStyle.Flat
                );
                await vscode.commands.executeCommand(
                    `${extensionName}.projectEnhancement.openProjects`
                );

                break;
            }
            case EQuickPickButton.AddGroups: {
                await vscode.commands.executeCommand(
                    "workbench.action.openSettings",
                    `${extensionName}.projectsOpen.groups`
                );

                break;
            }
        }
    });
    groupsQuickPick.onDidAccept(async () => {
        const [selectedGroup] = groupsQuickPick.selectedItems;
        await selectProjectsToOpen(selectedGroup, quickPickButtons);
    });
}

async function selectProjectsToOpen(
    selectedGroup: vscode.QuickPickItem,
    quickPickButtons: vscode.QuickInputButton[]
) {
    const projectsQuickPick = vscode.window.createQuickPick();
    projectsQuickPick.items =
        projectsOpenGroups
            .find(it => it.name === selectedGroup.label)
            ?.projects.map(({ name, fsPath }) => ({
                label: name ?? path.basename(fsPath),
                description: fsPath,
            })) ?? [];
    projectsQuickPick.canSelectMany = true;
    projectsQuickPick.placeholder = "[2/2] Select projects to open";
    projectsQuickPick.buttons = quickPickButtons;
    projectsQuickPick.show();
    projectsQuickPick.onDidTriggerButton(async ({ tooltip }) => {
        switch (tooltip) {
            case EQuickPickButton.ShowInFlatStyle: {
                await updateConfigurationItem(
                    `${extensionName}.projectsOpen.style`,
                    EProjectDisplayStyle.Flat
                );
                await vscode.commands.executeCommand(
                    `${extensionName}.projectEnhancement.openProjects`
                );

                break;
            }
            case EQuickPickButton.AddGroups: {
                await vscode.commands.executeCommand(
                    "workbench.action.openSettings",
                    `${extensionName}.projectsOpen.groups`
                );

                break;
            }
        }
    });
    projectsQuickPick.onDidAccept(async () => {
        await batchOpenProjects([...projectsQuickPick.selectedItems]);
    });
}

async function batchOpenProjects(projects: vscode.QuickPickItem[]) {
    await Promise.all(
        projects.map(async ({ label: name, description: fsPath }) => {
            try {
                CommonUtils.assert(
                    fsPath !== undefined,
                    `'fsPath' of project "${name}" is undefined.`
                );
                fsPath = formatHomeDirAlias(fsPath);
                CommonUtils.assert(
                    fs.existsSync(fsPath),
                    `'fsPath' "${fsPath}" of project "${name}" does not exist.`
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

async function openProjectsInFlatStyle() {
    // Flat all projects between groups into a single list with separators

    const projectsOptions: vscode.QuickPickItem[] = [];
    for (const group of projectsOpenGroups) {
        projectsOptions.push(
            {
                label: group.name,
                kind: vscode.QuickPickItemKind.Separator,
            },
            ...group.projects.map(
                ({ name, fsPath }) =>
                    ({
                        label: name ?? path.basename(fsPath),
                        description: fsPath,
                    } satisfies vscode.QuickPickItem)
            )
        );
    }

    // Select projects

    const quickPick = vscode.window.createQuickPick();
    quickPick.items = projectsOptions;
    quickPick.canSelectMany = true;
    quickPick.placeholder = "Select projects to open";
    quickPick.buttons = [
        {
            iconPath: new vscode.ThemeIcon("collapse-all"),
            tooltip: EQuickPickButton.ShowInGroupsStyle,
        },
        {
            iconPath: new vscode.ThemeIcon("add"),
            tooltip: EQuickPickButton.AddGroups,
        },
    ];
    quickPick.show();
    quickPick.onDidTriggerButton(async ({ tooltip }) => {
        try {
            switch (tooltip) {
                case EQuickPickButton.ShowInGroupsStyle: {
                    await updateConfigurationItem(
                        `${extensionName}.projectsOpen.style`,
                        EProjectDisplayStyle.Groups
                    );
                    await vscode.commands.executeCommand(
                        `${extensionName}.projectEnhancement.openProjects`
                    );

                    break;
                }
                case EQuickPickButton.AddGroups: {
                    await vscode.commands.executeCommand(
                        "workbench.action.openSettings",
                        `${extensionName}.projectsOpen.groups`
                    );

                    break;
                }
            }
        } catch (e) {
            logger.error(`Failed to update project display style.`, e);
        }
    });
    quickPick.onDidAccept(async () => {
        await batchOpenProjects([...quickPick.selectedItems]);
    });
}
