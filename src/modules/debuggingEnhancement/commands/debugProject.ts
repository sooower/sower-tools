import { vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/context";
import { getWorkspaceFolder } from "@/shared/utils/vscode";
import { CommonUtils } from "@utils/common";

import { debugProjectConfigurationNames } from "../configs";
import { getDebuggingConfigurations } from "./utils";

export function registerCommandDebugProject() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.debuggingEnhancement.debugProject`,
            async () => {
                try {
                    const debugProjectConfiguration =
                        getDebuggingConfigurations().find(it =>
                            debugProjectConfigurationNames.includes(it.name)
                        );
                    CommonUtils.assert(
                        debugProjectConfiguration !== undefined,
                        `Can not found project debugging config.`
                    );

                    if (vscode.debug.activeDebugSession !== undefined) {
                        vscode.debug.stopDebugging(
                            vscode.debug.activeDebugSession
                        );
                    }

                    await vscode.debug.startDebugging(getWorkspaceFolder(), {
                        ...debugProjectConfiguration,
                    });
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}
