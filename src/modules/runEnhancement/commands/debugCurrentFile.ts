import { extensionCtx, extensionName, logger, vscode } from "@/core";
import { getWorkspaceFolder } from "@/utils/vscode";
import { CommonUtils } from "@utils/common";

import { debugCurrentFileConfigurationNames } from "../configs";
import { getDebuggingConfigurations } from "../utils";

export function registerCommandDebugCurrentFile() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.runEnhancement.debugCurrentFile`,
            async () => {
                try {
                    const debugCurrentFileConfiguration =
                        getDebuggingConfigurations()?.find(it =>
                            debugCurrentFileConfigurationNames.includes(it.name)
                        );
                    CommonUtils.assert(
                        debugCurrentFileConfiguration !== undefined,
                        `Can not found current ts file debugging config.`
                    );

                    if (vscode.debug.activeDebugSession !== undefined) {
                        vscode.debug.stopDebugging(
                            vscode.debug.activeDebugSession
                        );
                    }

                    await vscode.debug.startDebugging(getWorkspaceFolder(), {
                        ...debugCurrentFileConfiguration,
                    });
                } catch (e) {
                    logger.error("Failed to debug current file.", e);
                }
            }
        )
    );
}
