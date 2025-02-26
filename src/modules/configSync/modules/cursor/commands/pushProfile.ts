import path from "node:path";

import vscode from "vscode";

import { extensionCtx, extensionName, format, fs, logger, os } from "@/core";
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
    if (!enableSyncCursorFiles) {
        const kEnableSyncCursorFiles = "Enable";

        const confirm = await vscode.window.showWarningMessage(
            "Sync cursor files is not enabled. Do you want to enable it and push profile again?",
            kEnableSyncCursorFiles
        );

        // If user confirm, enable sync cursor files and push profile again
        if (confirm === kEnableSyncCursorFiles) {
            await vscode.workspace
                .getConfiguration()
                .update(
                    `${extensionName}.configSync.cursor.enable`,
                    true,
                    vscode.ConfigurationTarget.Global
                );

            await pushCursorProfile();

            return;
        }

        return;
    }

    // Copy cursor profile to storage project

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

    // Push storage project to remote repository

    await execCommand({
        command: `git add .`,
        cwd: storageProjectRootDirPath,
        interactive: false,
    });

    const deviceName =
        (
            await execCommand({
                command: `system_profiler SPHardwareDataType | grep "Model Name" | awk '{print $3 $4}' && system_profiler SPHardwareDataType | grep "Chip" | awk '{print $3}'`,
                cwd: storageProjectRootDirPath,
                interactive: false,
            })
        )
            ?.split("\n")
            .map(line => line.trim())
            .join(" ") ?? "";

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
