import fs from "node:fs";
import path from "node:path";

import {
    ExtensionContext,
    Uri,
    workspace,
    WorkspaceConfiguration,
} from "vscode";

import CommonUtils from "./utils/commonUtils";

export let pluginCtx: ExtensionContext;
export let pluginName: string;

export let workspaceConfig: WorkspaceConfiguration;
export let userConfig: WorkspaceConfiguration;
export let enableOverwriteFile: boolean;
export let specialWordsMap: Map<string, string>;

export function init(context: ExtensionContext) {
    pluginCtx = context;
    const packageJsonContent = JSON.parse(
        fs.readFileSync(
            path.join(context.extensionPath, "package.json"),
            "utf-8"
        )
    );
    pluginName = CommonUtils.mandatory(packageJsonContent.name);

    reloadConfiguration();

    console.log(`${pluginName} is now active!`);
}

export async function subscribeReloadConfiguration() {
    const reloadConfig = workspace.onDidChangeConfiguration(() => {
        reloadConfiguration();
    });
    pluginCtx.subscriptions.push(reloadConfig);
}

function reloadConfiguration() {
    workspaceConfig = workspace.getConfiguration(
        undefined,
        Uri.file(".vscode/settings.json")
    );
    userConfig = workspace.getConfiguration();

    enableOverwriteFile = CommonUtils.assertBoolean(
        getSettingItem(`${pluginName}.GenerateModel.enableOverwriteFile`)
    );

    const specialWordsArr = CommonUtils.assertArray(
        getSettingItem(`${pluginName}.GenerateModel.specialWordsMapping`)
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

export function getSettingItem(name: string): unknown {
    return workspaceConfig.get(name) ?? userConfig.get(name);
}
