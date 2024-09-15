import { vscode } from "@/shared";
import {
    extensionCtx,
    extensionName,
    getConfigurationItem,
} from "@/shared/init";
import { getWorkspaceFolder } from "@/shared/utils/vscode";
import { CommonUtils } from "@utils/common";

import { getDebuggingConfigurations } from "./utils";

export function subscribeDebugCurrentFile() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.debuggingEnhancement.debugCurrentFile`,
        async () => {
            try {
                const debugCurrentFileConfigurationNames =
                    CommonUtils.assertArray(
                        getConfigurationItem(
                            `${extensionName}.debuggingEnhancement.debugCurrentFileConfigurationNames`
                        )
                    ).map((it) => CommonUtils.assertString(it));
                const debugCurrentFileConfiguration =
                    getDebuggingConfigurations().find((it) =>
                        debugCurrentFileConfigurationNames.includes(it.name)
                    );
                CommonUtils.assert(
                    debugCurrentFileConfiguration !== undefined,
                    `Can not found current ts file debugging config.`
                );

                if (vscode.debug.activeDebugSession !== undefined) {
                    vscode.debug.stopDebugging(vscode.debug.activeDebugSession);
                }

                await vscode.debug.startDebugging(getWorkspaceFolder(), {
                    ...debugCurrentFileConfiguration,
                });
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}
