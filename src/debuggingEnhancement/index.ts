import fs from "node:fs";

import { parse } from "comment-json";
import path from "path";
import { commands, debug, window, workspace } from "vscode";

import { extensionCtx, extensionName, getSettingItem } from "../shared";
import CommonUtils from "../shared/utils/commonUtils";

type TLaunchConfiguration = {
    name: string;
    type: string;
    request: string;
    args: string[];
    runtimeArgs: string[];
    cwd: string;
    internalConsoleOptions: string;
    skipFiles: string[];
    env?: { [key: string]: string };
    envFile: string;
};

export async function subscribeDebuggingEnhancement() {
    /* Subscribe debug project command */

    const debugProject = commands.registerCommand(
        `${extensionName}.debugProject`,
        async () => {
            try {
                const debugProjectConfiguration =
                    getDebuggingConfigurations().find(
                        (it) =>
                            it.name ===
                            getSettingItem(
                                `${extensionName}.DebuggingEnhancement.debugProjectConfigurationName`
                            )
                    );
                CommonUtils.assert(
                    debugProjectConfiguration !== undefined,
                    `Can not found project debugging config.`
                );

                if (debug.activeDebugSession !== undefined) {
                    debug.stopDebugging(debug.activeDebugSession);
                }

                const [workspaceFolder] = CommonUtils.mandatory(
                    workspace.workspaceFolders
                );
                await debug.startDebugging(workspaceFolder, {
                    ...debugProjectConfiguration,
                });
            } catch (e) {
                console.error(e);
                window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(debugProject);

    /* Subscribe debug current file command */

    const debugCurrentFile = commands.registerCommand(
        `${extensionName}.debugCurrentFile`,
        async () => {
            try {
                const debugCurrentFileConfiguration =
                    getDebuggingConfigurations().find(
                        (it) =>
                            it.name ===
                            getSettingItem(
                                `${extensionName}.DebuggingEnhancement.debugCurrentFileConfigurationName`
                            )
                    );
                CommonUtils.assert(
                    debugCurrentFileConfiguration !== undefined,
                    `Can not found current ts file debugging config.`
                );

                if (debug.activeDebugSession !== undefined) {
                    debug.stopDebugging(debug.activeDebugSession);
                }

                const [workspaceFolder] = CommonUtils.mandatory(
                    workspace.workspaceFolders
                );
                await debug.startDebugging(workspaceFolder, {
                    ...debugCurrentFileConfiguration,
                });
            } catch (e) {
                console.error(e);
                window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(debugCurrentFile);
}

function getDebuggingConfigurations() {
    const launch = CommonUtils.cloneObjectWithKeys(loadLaunchJsonContent(), [
        "configurations",
    ]);
    const configurations: TLaunchConfiguration[] = CommonUtils.assertArray(
        launch.configurations
    )
        .map((it) =>
            CommonUtils.cloneObjectWithKeys(it, [
                "name",
                "type",
                "request",
                "args",
                "runtimeArgs",
                "cwd",
                "internalConsoleOptions",
                "skipFiles",
                "env",
                "envFile",
            ])
        )
        .map((it) => ({
            name: CommonUtils.assertString(it.name),
            type: CommonUtils.assertString(it.type),
            request: CommonUtils.assertString(it.request),
            args: CommonUtils.assertArray(it.args).map((it) =>
                CommonUtils.assertString(it)
            ),
            runtimeArgs: CommonUtils.assertArray(it.runtimeArgs).map((it) =>
                CommonUtils.assertString(it)
            ),
            cwd: CommonUtils.assertString(it.cwd),
            internalConsoleOptions: CommonUtils.assertString(
                it.internalConsoleOptions
            ),
            skipFiles: CommonUtils.assertArray(it.skipFiles).map((it) =>
                CommonUtils.assertString(it)
            ),
            env: it.env as any,
            envFile: CommonUtils.assertString(it.envFile),
        }));

    CommonUtils.assert(
        configurations.length > 0,
        "launch.json must have at least one configuration."
    );

    return configurations;
}

function loadLaunchJsonContent(): unknown {
    try {
        const [workspaceFolder] = CommonUtils.mandatory(
            workspace.workspaceFolders
        );

        const launchConfigPath = path.join(
            workspaceFolder.uri.fsPath,
            ".vscode",
            "launch.json"
        );
        CommonUtils.assert(
            fs.existsSync(launchConfigPath),
            `Launch file is not exists.`
        );
        const content = fs.readFileSync(launchConfigPath, "utf8");

        return parse(content);
    } catch (e) {
        throw new Error(`Parse launch.json failed, error: ${e}`);
    }
}
