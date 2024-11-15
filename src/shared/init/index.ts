import path from "node:path";

import { CommonUtils } from "@utils/common";

import { fs, vscode } from "../";

export let extensionCtx: vscode.ExtensionContext;
export let extensionName: string;

export let enableOverwriteFile: boolean;
export let specialWordsMap: Map<string, string>;
export let ignoredInsertionColumns: string[];
export let ignoredUpdatingColumns: string[];

export let nodeBuiltinModules: string[];
export let enableUpdateNodeBuiltinImports: boolean;

export let enableReplaceText: boolean;

export let enableShowDefaultOpenedDocument: boolean;
export let defaultOpenedDocumentNames: string[];

export let enableShowNowTimestamp: boolean;

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
}

let workspaceConfig: vscode.WorkspaceConfiguration;
let userConfig: vscode.WorkspaceConfiguration;

export function reloadConfiguration() {
    workspaceConfig = vscode.workspace.getConfiguration(
        undefined,
        vscode.Uri.file(".vscode/settings.json")
    );
    userConfig = vscode.workspace.getConfiguration();

    /* databaseModel  */

    enableOverwriteFile = CommonUtils.assertBoolean(
        getConfigurationItem(
            `${extensionName}.databaseModel.enableOverwriteFile`
        )
    );

    const specialUppercaseWordsArr = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.databaseModel.specialUpperCaseWordsMapping`
        )
    )
        .map((it) => CommonUtils.assertString(it))

        .map((it) => {
            const kv = it.split(":");
            CommonUtils.assert(
                kv.length === 2,
                `Invalid special uppercase words mapping: ${it}, formatting should be "from:to".`
            );
            return kv;
        });

    specialWordsMap = new Map(
        specialUppercaseWordsArr.map((it) => [it[0], it[1]])
    );

    ignoredInsertionColumns = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.databaseModel.ignoredInsertionColumns`
        )
    ).map((it) => CommonUtils.assertString(it));

    ignoredUpdatingColumns = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.databaseModel.ignoredUpdatingColumns`
        )
    ).map((it) => CommonUtils.assertString(it));

    /* updateImports */

    nodeBuiltinModules = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.updateImports.nodeBuiltinModules`
        )
    ).map((it) => CommonUtils.assertString(it));
    enableUpdateNodeBuiltinImports = CommonUtils.assertBoolean(
        getConfigurationItem(
            `${extensionName}.updateImports.enableUpdateNodeBuiltinImports`
        )
    );

    /* stringTools */

    enableReplaceText = CommonUtils.assertBoolean(
        getConfigurationItem(`${extensionName}.stringTools.enableReplaceText`)
    );

    /* showDefaultOpenedDocuments */

    enableShowDefaultOpenedDocument = CommonUtils.assertBoolean(
        getConfigurationItem(
            `${extensionName}.showDefaultOpenedDocument.enable`
        )
    );
    defaultOpenedDocumentNames = CommonUtils.assertArray(
        getConfigurationItem(
            `${extensionName}.showDefaultOpenedDocument.documentNames`
        )
    ).map((it) => CommonUtils.assertString(it));

    /* showNowTimestamp */
    enableShowNowTimestamp = CommonUtils.assertBoolean(
        getConfigurationItem(`${extensionName}.showNowTimestamp.enable`)
    );
}

export function getConfigurationItem(name: string): unknown {
    return workspaceConfig.get(name) ?? userConfig.get(name);
}
