import { vscode } from "@/shared";
import {
    extensionCtx,
    extensionName,
    getConfigurationItem,
} from "@/shared/init";
import CommonUtils from "@/shared/utils/commonUtils";
import { getWorkspaceFolder } from "@/shared/utils/vscode";

import { getDebuggingConfigurations } from "./utils";

export function subscribeDebugProject() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.debuggingEnhancement.debugProject`,
        async () => {
            try {
                const debugProjectConfigurationNames = CommonUtils.assertArray(
                    getConfigurationItem(
                        `${extensionName}.debuggingEnhancement.debugProjectConfigurationNames`
                    )
                ).map((it) => CommonUtils.assertString(it));
                const debugProjectConfiguration =
                    getDebuggingConfigurations().find((it) =>
                        debugProjectConfigurationNames.includes(it.name)
                    );
                CommonUtils.assert(
                    debugProjectConfiguration !== undefined,
                    `Can not found project debugging config.`
                );

                if (vscode.debug.activeDebugSession !== undefined) {
                    vscode.debug.stopDebugging(vscode.debug.activeDebugSession);
                }

                await vscode.debug.startDebugging(getWorkspaceFolder(), {
                    ...debugProjectConfiguration,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}
