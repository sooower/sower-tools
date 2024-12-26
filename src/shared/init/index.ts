import path from "node:path";

import z from "zod";

import { CommonUtils } from "@utils/common";

import { fs, vscode } from "../";

export let extensionCtx: vscode.ExtensionContext;
export let extensionName: string;

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

    parseDatabaseModelConfigs();
    parseUpdateImportsConfigs();
    parseStringToolsConfigs();
    parseShowDefaultOpenedDocumentsConfigs();
    parseShowTimestampConfigs();
    parseKeyCryptoToolsConfigs();
    parseOpenFilesInDirConfigs();
    parseCountdownTimerConfigs();
}

export function getConfigurationItem(name: string): unknown {
    return workspaceConfig.get(name) ?? userConfig.get(name);
}

// Database model

export let enableOverwriteFile: boolean;
export let specialWordsMap: Map<string, string>;
export let ignoredInsertionColumns: string[];
export let ignoredUpdatingColumns: string[];

function parseDatabaseModelConfigs() {
    enableOverwriteFile = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.enableOverwriteFile`
            )
        );

    specialWordsMap = new Map(
        z
            .array(
                z.string().transform(it => {
                    const [originalWord, mappedWord] = it.split(":");
                    CommonUtils.assert(
                        originalWord !== undefined && mappedWord !== undefined,
                        `Invalid special uppercase words mapping: ${it}, formatting should be "<originalWord>:<mappedWord>".`
                    );

                    return [originalWord, mappedWord] satisfies [
                        string,
                        string
                    ];
                })
            )
            .parse(
                getConfigurationItem(
                    `${extensionName}.databaseModel.specialUpperCaseWordsMapping`
                )
            )
    );

    ignoredInsertionColumns = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.ignoredInsertionColumns`
            )
        );

    ignoredUpdatingColumns = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.databaseModel.ignoredUpdatingColumns`
            )
        );
}

// Update imports

export let nodeBuiltinModules: string[];
export let enableUpdateNodeBuiltinImports: boolean;

function parseUpdateImportsConfigs() {
    nodeBuiltinModules = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.updateImports.nodeBuiltinModules`
            )
        );
    enableUpdateNodeBuiltinImports = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.updateImports.enableUpdateNodeBuiltinImports`
            )
        );
}

// String tools

export let enableReplaceText: boolean;

function parseStringToolsConfigs() {
    enableReplaceText = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.stringTools.enableReplaceText`
            )
        );
}

// Show default opened documents

export let enableShowDefaultOpenedDocument: boolean;
export let defaultOpenedDocumentNames: string[];

function parseShowDefaultOpenedDocumentsConfigs() {
    enableShowDefaultOpenedDocument = z
        .boolean()
        .parse(
            getConfigurationItem(
                `${extensionName}.showDefaultOpenedDocument.enable`
            )
        );
    defaultOpenedDocumentNames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.showDefaultOpenedDocument.documentNames`
            )
        );
}

// Show timestamp

export let enableShowNowTimestamp: boolean;

function parseShowTimestampConfigs() {
    enableShowNowTimestamp = z
        .boolean()
        .parse(
            getConfigurationItem(`${extensionName}.showNowTimestamp.enable`)
        );
}

// Key crypto tools

export let keyCryptoToolsKey: string;

function parseKeyCryptoToolsConfigs() {
    keyCryptoToolsKey = z
        .string()
        .parse(getConfigurationItem(`${extensionName}.keyCryptoTools.key`));
}

// Open files in dir

export let skippedShowFilenames: string[];

function parseOpenFilesInDirConfigs() {
    skippedShowFilenames = z
        .array(z.string())
        .parse(
            getConfigurationItem(
                `${extensionName}.dirEnhancement.skippedShowFilenames`
            )
        );
}

// Countdown timer

const countdownTimerOptionSchema = z.object({
    label: z.string(),
    duration: z
        .number()
        .positive()
        .transform(it => it * 1000),
});

export type TCountdownTimerOption = z.infer<typeof countdownTimerOptionSchema>;

export const kRestore = "Restore";
export let countdownTimerOptions: TCountdownTimerOption[];

function parseCountdownTimerConfigs() {
    countdownTimerOptions = [
        {
            label: kRestore,
            duration: 0,
        },
    ].concat(
        ...z
            .array(countdownTimerOptionSchema)
            .optional()
            .default([])
            .parse(
                getConfigurationItem(`${extensionName}.countdownTimer.options`)
            )
    );
}
