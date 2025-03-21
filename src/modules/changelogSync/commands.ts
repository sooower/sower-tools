import path from "node:path";

import markdownIt from "markdown-it";
import z from "zod";

import { extensionCtx, extensionName, fs, logger, vscode } from "@/core";
import { getWorkspaceFolderPath } from "@/utils/vscode";
import { readJsonFile } from "@utils/fs";

export function registerCommandSyncChangelog() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.changelogSync.syncChangelog`,
            async (document: vscode.TextDocument) => {
                try {
                    // Save modified content in opened document before syncing the changelog
                    await vscode.workspace.save(document.uri);

                    await syncChangelog();
                } catch (e) {
                    logger.error("Failed to sync changelog.", e);
                }
            }
        )
    );
}

export async function syncChangelog() {
    const result = await findNewVersionAndAddItems();
    if (result === undefined) {
        return;
    }

    const { newVersion, newAddedItems } = result;

    if (newVersion !== undefined) {
        await updatePackageFile(newVersion);
        await updatePm2ConfigFile(newVersion);
    }
    if (newAddedItems !== undefined) {
        await updateReadmeFile(newAddedItems);
    }
}

async function findNewVersionAndAddItems(changelogFilename = "CHANGELOG.md") {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const changelogContent = fs.readFileSync(
        path.join(workspaceFolderPath, changelogFilename),
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
                if (nextToken.type === "inline") {
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
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const packageFilePath = path.join(workspaceFolderPath, filename);
    if (!fs.existsSync(packageFilePath)) {
        return;
    }

    const content = z
        .object({
            name: z.string(),
            displayName: z.string().optional(),
            description: z.string().optional(),
            version: z.string().optional(),
        })
        .passthrough()
        .parse(readJsonFile(packageFilePath));
    if (content.version === lastVersion) {
        return;
    }

    // Update version

    content.version = lastVersion;
    fs.writeFileSync(packageFilePath, JSON.stringify(content, null, 4) + "\n");

    logger.info(`Updated file "${path.basename(packageFilePath)}".`);
}

async function updatePm2ConfigFile(
    newVersion: string,
    filename = "pm2.config.json"
) {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const pm2ConfigFilePath = path.join(workspaceFolderPath, filename);
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

    logger.info(`Updated file "${path.basename(pm2ConfigFilePath)}".`);
}

async function updateReadmeFile(
    newAddedItems: string[],
    filename = "README.md"
) {
    const workspaceFolderPath = getWorkspaceFolderPath();
    if (workspaceFolderPath === undefined) {
        return;
    }

    const readmeFilePath = path.join(workspaceFolderPath, filename);
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
        .filter(it => it.trim() !== "")
        .map(it => (it.trim() === "" ? it : it.endsWith(".") ? it : it + "."))
        .filter(it => !existsFeatures.includes(it));

    if (appendedFeatures.length === 0) {
        return;
    }

    readmeContentLines.splice(featureEndIndex - 1, 0, ...appendedFeatures);
    fs.writeFileSync(readmeFilePath, readmeContentLines.join("\n"));

    logger.info(`Updated file "${path.basename(readmeFilePath)}".`);
}
