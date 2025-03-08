import path from "node:path";

import {
    extensionCtx,
    extensionName,
    fs,
    logger,
    updateConfigurationItem,
    vscode,
} from "@/core";
import { parseHomeDirAlias } from "@/utils/common";
import { execCommand } from "@utils/command";
import { CommonUtils } from "@utils/common";

import { enableSyncCursorFiles, profile } from "../configs";
import { kProfileBakDirName, kProfileTarGzFileName } from "../const";

export function registerCommandPullCursorProfile() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.configSync.cursor.pullProfile`,
            async (document: vscode.TextDocument, range: vscode.Range) => {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Pulling cursor profile",
                        cancellable: false,
                    },
                    async (progress, token) => {
                        try {
                            await pullCursorProfile();
                        } catch (e) {
                            logger.error("Failed to pull cursor profile.", e);
                        }
                    }
                );
            }
        )
    );
}

async function pullCursorProfile() {
    // Show alert to double check if user want to pull cursor profile

    const kPullProfile = "Pull and override";
    const confirm = await vscode.window.showWarningMessage(
        "This action will pull cursor profile from remote repository and override the local cursor profile. Do you want to continue?",
        { modal: true },
        kPullProfile
    );
    if (confirm !== kPullProfile) {
        return;
    }

    // If sync cursor files is not enabled, enable it and pull profile again
    if (!enableSyncCursorFiles) {
        const kEnableSyncCursorFiles = "Enable";

        const confirm = await vscode.window.showWarningMessage(
            "Sync cursor files is not enabled. Do you want to enable it and pull profile again?",
            kEnableSyncCursorFiles
        );

        // If user confirm, enable sync cursor files and pull profile again
        if (confirm === kEnableSyncCursorFiles) {
            await updateConfigurationItem(
                `${extensionName}.configSync.cursor.enable`,
                true
            );
            await pullCursorProfile();

            return;
        }

        return;
    }

    // Pull profile from remote repository and update to cursor profile

    const profileDirPath = parseHomeDirAlias(profile.profileDirPath);
    const storageProjectRootDirPath = parseHomeDirAlias(
        profile.storage.projectRootDirPath
    );

    CommonUtils.assert(
        fs.existsSync(profileDirPath),
        `Cannot found profile directory "${profileDirPath}".`
    );
    CommonUtils.assert(
        fs.existsSync(storageProjectRootDirPath),
        `Cannot found storage project root directory "${storageProjectRootDirPath}".`
    );

    const storageDirPath = path.join(
        storageProjectRootDirPath,
        profile.storage.dirName.trim()
    );
    await execCommand({
        command: `git pull`,
        cwd: storageProjectRootDirPath,
        interactive: false,
    });
    await fs.promises.cp(
        path.join(storageDirPath, kProfileTarGzFileName),
        path.join(path.dirname(profileDirPath), kProfileTarGzFileName),
        {
            recursive: true,
        }
    );
    const profileBakDirPath = path.join(
        path.dirname(profileDirPath),
        kProfileBakDirName
    );
    if (fs.existsSync(profileBakDirPath)) {
        await fs.promises.rm(profileBakDirPath, {
            recursive: true,
            force: true,
        });
    }
    await fs.promises.cp(profileDirPath, profileBakDirPath, {
        recursive: true,
    });
    await execCommand({
        command: `rm -rf ./*`,
        cwd: profileDirPath,
        interactive: false,
    });
    await execCommand({
        command: `tar -zxvf ../${kProfileTarGzFileName}`,
        cwd: profileDirPath,
        interactive: false,
    });

    logger.info("Pull cursor profile successfully.");
}
