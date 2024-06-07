import { parse } from "comment-json";
import path from "path";

import { fs, vscode } from "../../shared";
import {
    extensionCtx,
    extensionName,
    getConfigurationItem,
} from "../../shared/init";
import CommonUtils from "../../shared/utils/commonUtils";

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

export function subscribeDebuggingEnhancement() {
    /* Subscribe command of debug project */

    const commandDebugProject = vscode.commands.registerCommand(
        `${extensionName}.debugProject`,
        async () => {
            try {
                const debugProjectConfiguration =
                    getDebuggingConfigurations().find(
                        (it) =>
                            it.name ===
                            getConfigurationItem(
                                `${extensionName}.DebuggingEnhancement.debugProjectConfigurationName`
                            )
                    );
                CommonUtils.assert(
                    debugProjectConfiguration !== undefined,
                    `Can not found project debugging config.`
                );

                if (vscode.debug.activeDebugSession !== undefined) {
                    vscode.debug.stopDebugging(vscode.debug.activeDebugSession);
                }

                const [workspaceFolder] = CommonUtils.mandatory(
                    vscode.workspace.workspaceFolders
                );
                await vscode.debug.startDebugging(workspaceFolder, {
                    ...debugProjectConfiguration,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(commandDebugProject);

    /* Subscribe command of debug current file */

    const commandDebugCurrentFile = vscode.commands.registerCommand(
        `${extensionName}.debugCurrentFile`,
        async () => {
            try {
                const debugCurrentFileConfiguration =
                    getDebuggingConfigurations().find(
                        (it) =>
                            it.name ===
                            getConfigurationItem(
                                `${extensionName}.DebuggingEnhancement.debugCurrentFileConfigurationName`
                            )
                    );
                CommonUtils.assert(
                    debugCurrentFileConfiguration !== undefined,
                    `Can not found current ts file debugging config.`
                );

                if (vscode.debug.activeDebugSession !== undefined) {
                    vscode.debug.stopDebugging(vscode.debug.activeDebugSession);
                }

                const [workspaceFolder] = CommonUtils.mandatory(
                    vscode.workspace.workspaceFolders
                );
                await vscode.debug.startDebugging(workspaceFolder, {
                    ...debugCurrentFileConfiguration,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );
    extensionCtx.subscriptions.push(commandDebugCurrentFile);
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
            vscode.workspace.workspaceFolders
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
