import path from "node:path";

import markdownIt from "markdown-it";

import { fs, vscode } from "@/shared";
import { extensionCtx, extensionName } from "@/shared/init";
import { getWorkspaceFolderPath } from "@/shared/utils/vscode";

export function subscribeSyncChangelog() {
    const command = vscode.commands.registerCommand(
        `${extensionName}.syncChangelog`,
        async () => {
            try {
                const editor = vscode.window.activeTextEditor;
                if (editor === undefined) {
                    return;
                }

                if (editor.document.languageId !== "markdown") {
                    return;
                }

                // Save modified content in opened document before syncing the changelog
                await vscode.workspace.save(editor.document.uri);

                await syncChangelog();
            } catch (e) {
                console.error(e);
                vscode.window.showErrorMessage(`${e}`);
            }
        }
    );

    extensionCtx.subscriptions.push(command);
}

export async function syncChangelog() {
    const { newVersion, newAddedItems } = await findNewVersionAndAddItems();

    if (newVersion !== undefined) {
        await updatePackageFile(newVersion);
        await updatePm2ConfigFile(newVersion);
    }
    if (newAddedItems !== undefined) {
        await updateReadmeFile(newAddedItems);
    }
}

async function findNewVersionAndAddItems(changelogFilename = "CHANGELOG.md") {
    const changelogContent = fs.readFileSync(
        path.join(getWorkspaceFolderPath(), changelogFilename),
        "utf-8"
    );
    const tokens = markdownIt().parse(changelogContent, {});

    let newVersion: string | undefined;
    let newAddedItems: string[] | undefined;

    let foundNewVersion = false;
    let foundNewAddTitle = false;
    let foundNewAddItems = false;
    for (const token of tokens) {
        // Find new version

        if (!foundNewVersion) {
            if (
                token.type === "heading_open" &&
                token.tag === "h2" &&
                token.level === 0
            ) {
                const nextToken = tokens[tokens.indexOf(token) + 1];
                if (nextToken !== undefined && nextToken.type === "inline") {
                    const matchedVersion =
                        nextToken.content.match(/^\[(\d+\.\d+\.\d+)\]/);
                    if (matchedVersion !== null) {
                        [, newVersion] = matchedVersion;

                        foundNewVersion = true;
                    }
                }
            }
        }

        // Find new added items

        if (
            token.type === "heading_open" &&
            token.tag === "h3" &&
            token.level === 0
        ) {
            const nextToken = tokens[tokens.indexOf(token) + 1];
            if (
                nextToken !== undefined &&
                nextToken.type === "inline" &&
                nextToken.content.trim() === "Added"
            ) {
                foundNewAddTitle = true;
            }
        }

        if (foundNewAddTitle && !foundNewAddItems) {
            if (token.type === "bullet_list_open" && token.map !== null) {
                const [listStartIndex, listEndIndex] = token.map;
                newAddedItems = changelogContent
                    .split(/\r?\n/)
                    .slice(listStartIndex, listEndIndex);

                foundNewAddItems = true;
            }
        }
    }

    return {
        newVersion,
        newAddedItems,
    };
}

async function updatePackageFile(
    lastVersion: string,
    filename = "package.json"
) {
    const packageFilePath = path.join(getWorkspaceFolderPath(), filename);
    if (!fs.existsSync(packageFilePath)) {
        return;
    }

    const content = JSON.parse(fs.readFileSync(packageFilePath, "utf-8"));
    if (!content.version || content.version === lastVersion) {
        return;
    }

    // Update version

    content.version = lastVersion;
    fs.writeFileSync(packageFilePath, JSON.stringify(content, null, 4) + "\n");

    vscode.window.showInformationMessage(
        `Updated file "${path.basename(packageFilePath)}".`
    );
}

async function updatePm2ConfigFile(
    newVersion: string,
    filename = "pm2.config.json"
) {
    const pm2ConfigFilePath = path.join(getWorkspaceFolderPath(), filename);
    if (!fs.existsSync(pm2ConfigFilePath)) {
        return;
    }

    const content = JSON.parse(fs.readFileSync(pm2ConfigFilePath, "utf8"));

    if (content.apps.length === 0) {
        return;
    }

    // Update version

    const [appName, currVersion] = content.apps[0].name.split(":");
    if (currVersion === newVersion) {
        return;
    }

    content.apps[0].name = `${appName}:${newVersion}`;
    fs.writeFileSync(
        pm2ConfigFilePath,
        JSON.stringify(content, null, 4) + "\n"
    );

    vscode.window.showInformationMessage(
        `Updated file "${path.basename(pm2ConfigFilePath)}".`
    );
}

async function updateReadmeFile(
    newAddedItems: string[],
    filename = "README.md"
) {
    const readmeFilePath = path.join(getWorkspaceFolderPath(), filename);
    if (!fs.existsSync(readmeFilePath)) {
        return;
    }

    const readmeContent = fs.readFileSync(readmeFilePath, "utf-8");
    const tokens = markdownIt().parse(readmeContent, {});

    // Find exists features items

    let featureStartIndex: number | undefined;
    let featureEndIndex: number | undefined;

    let foundFeatureTitle = false;
    for (const token of tokens) {
        if (
            token.type === "heading_open" &&
            token.tag === "h2" &&
            token.level === 0
        ) {
            const nextToken = tokens[tokens.indexOf(token) + 1];
            if (
                nextToken !== undefined &&
                nextToken.type === "inline" &&
                nextToken.content.trim() === "Features"
            ) {
                foundFeatureTitle = true;
            }
        }

        if (foundFeatureTitle) {
            if (token.type === "bullet_list_open" && token.map !== null) {
                [featureStartIndex, featureEndIndex] = token.map;

                break;
            }
        }
    }

    if (featureEndIndex === undefined) {
        return;
    }

    // Append new items to features

    const readmeContentLines = readmeContent.split(/\r?\n/);

    const existsFeatures = readmeContentLines.slice(
        featureStartIndex,
        featureEndIndex
    );
    const appendedFeatures = newAddedItems
        .filter((it) => it.trim() !== "")
        .map((it) => (it.trim() === "" ? it : it.endsWith(".") ? it : it + "."))
        .filter((it) => !existsFeatures.includes(it));

    if (appendedFeatures.length === 0) {
        return;
    }

    readmeContentLines.splice(featureEndIndex - 1, 0, ...appendedFeatures);
    fs.writeFileSync(readmeFilePath, readmeContentLines.join("\n"));

    vscode.window.showInformationMessage(
        `Updated file "${path.basename(readmeFilePath)}".`
    );
}
