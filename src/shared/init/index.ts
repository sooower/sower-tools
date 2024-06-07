import path from "node:path";

import { fs, vscode } from "../";
import CommonUtils from "../utils/commonUtils";

/* Extension configurations */
export let extensionCtx: vscode.ExtensionContext;
export let extensionName: string;

/* Generate modal configurations */
export let enableOverwriteFile: boolean;
export let specialWordsMap: Map<string, string>;

export function init(context: vscode.ExtensionContext) {
    const packageJsonContent = JSON.parse(
        fs.readFileSync(
            path.join(context.extensionPath, "package.json"),
            "utf-8"
        )
    );
    extensionCtx = context;
    extensionName = CommonUtils.mandatory(packageJsonContent.name);

    reloadConfiguration();

    console.log(`${extensionName} is now active!`);
}

let workspaceConfig: vscode.WorkspaceConfiguration;
let userConfig: vscode.WorkspaceConfiguration;

export function reloadConfiguration() {
    workspaceConfig = vscode.workspace.getConfiguration(
        undefined,
        vscode.Uri.file(".vscode/settings.json")
    );
    userConfig = vscode.workspace.getConfiguration();

    enableOverwriteFile = CommonUtils.assertBoolean(
        getConfigurationItem(
            `${extensionName}.GenerateModel.enableOverwriteFile`
        )
    );

    const specialWordsArr = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.GenerateModel.specialWordsMapping`
        )
    )
        .map((it) => CommonUtils.assertString(it))
        .map((it) => {
            const kv = it.split(":");
            CommonUtils.assert(
                kv.length === 2,
                `Invalid special words mapping: ${it}, formatting should be "from:to".`
            );
            return kv;
        });
    specialWordsMap = new Map(specialWordsArr.map((it) => [it[0], it[1]]));
}

export function getConfigurationItem(name: string): unknown {
    return workspaceConfig.get(name) ?? userConfig.get(name);
}