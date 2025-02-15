import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { getWorkspaceFolder } from "@/shared/utils/vscode";
import { CommonUtils } from "@utils/common";

import { debugCurrentFileConfigurationNames } from "../configs";
import { getDebuggingConfigurations } from "./utils";

export function registerCommandDebugCurrentFile() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.debuggingEnhancement.debugCurrentFile`,
            async () => {
                try {
                    const debugCurrentFileConfiguration =
                        getDebuggingConfigurations().find(it =>
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
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}
