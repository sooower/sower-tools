import path from "node:path";

import vscode from "vscode";

import {
    extensionCtx,
    extensionName,
    format,
    fs,
    logger,
    os,
    updateConfigurationItem,
} from "@/core";
import { execCommand } from "@utils/command";
import { CommonUtils } from "@utils/common";

import { enableSyncCursorFiles, profile } from "../configs";
import { kProfileTarGzFileName } from "./const";

export function registerCommandPushCursorProfile() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.configSync.cursor.pushProfile`,
            async (document: vscode.TextDocument, range: vscode.Range) => {
                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "Pushing cursor profile",
                        cancellable: false,
                    },
                    async (progress, token) => {
                        try {
                            await pushCursorProfile();
                            logger.info("Push cursor profile successfully.");
                        } catch (e) {
                            logger.error("Failed to push cursor profile.", e);
                        }
                    }
                );
            }
        )
    );
}

async function pushCursorProfile() {
    // Show alert to double check if user want to push cursor profile

    const kPushProfile = "Push";
    const confirm = await vscode.window.showWarningMessage(
        "This action will push local cursor profile to remote repository. Do you want to continue?",
        { modal: true },
        kPushProfile
    );
    if (confirm !== kPushProfile) {
        return;
    }

    // If sync cursor files is not enabled, enable it and push profile again
    if (!enableSyncCursorFiles) {
        const kEnableSyncCursorFiles = "Enable";

        const confirm = await vscode.window.showWarningMessage(
            "Sync cursor files is not enabled. Do you want to enable it and push profile again?",
            kEnableSyncCursorFiles
        );

        if (confirm === kEnableSyncCursorFiles) {
            await updateConfigurationItem(
                `${extensionName}.configSync.cursor.enable`,
                true
            );
            await pushCursorProfile();

            return;
        }

        return;
    }

    // Copy cursor profile to storage project and push to remote repository

    const profileDirPath = profile.profileDirPath
        .trim()
        .replace(/^~/, os.homedir());
    const storageProjectRootDirPath = profile.storage.projectRootDirPath
        .trim()
        .replace(/^~/, os.homedir());

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
        command: `tar -zcvf ${kProfileTarGzFileName} .`,
        cwd: profileDirPath,
        interactive: false,
    });
    await fs.promises.cp(
        path.join(profileDirPath, kProfileTarGzFileName),
        path.join(storageDirPath, kProfileTarGzFileName),
        { recursive: true }
    );
    await execCommand({
        command: `git add .`,
        cwd: storageProjectRootDirPath,
        interactive: false,
    });
    const deviceName = await execCommand({
        command: `system_profiler SPHardwareDataType | awk '/Model Name/ {printf $3 $4 " "} /Chip/ {print $3}'`,
        cwd: storageProjectRootDirPath,
        interactive: false,
    });
    await execCommand({
        command: format(
            `git commit -m "feat: update cursor profile%s"`,
            deviceName !== "" ? ` from '${deviceName}'` : ""
        ),
        cwd: storageProjectRootDirPath,
        interactive: false,
    });
    await execCommand({
        command: `git push`,
        cwd: storageProjectRootDirPath,
        interactive: false,
    });
}
