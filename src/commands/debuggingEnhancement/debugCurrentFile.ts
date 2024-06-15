import { vscode } from "@/shared";
import {
    extensionCtx,
    extensionName,
    getConfigurationItem,
} from "@/shared/init";
import CommonUtils from "@/shared/utils/commonUtils";
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

    extensionCtx.subscriptions.push(command);
}
