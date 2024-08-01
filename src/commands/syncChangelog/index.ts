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
    const { lastVersion, lastAddedItems } = await findLastVersionAndAddItems();

    if (lastVersion !== undefined) {
        await updatePackageFile(lastVersion);
    }
    if (lastAddedItems !== undefined) {
        await updateReadmeFile(lastAddedItems);
    }
}

async function findLastVersionAndAddItems(changelogFilename = "CHANGELOG.md") {
    const changelogContent = fs.readFileSync(
        path.join(getWorkspaceFolderPath(), changelogFilename),
        "utf-8"
    );
    const tokens = markdownIt().parse(changelogContent, {});

    let lastVersion: string | undefined;
    let lastAddedItems: string[] | undefined;

    let foundLastVersion = false;
    let foundLastAddTitle = false;
    let foundLastAddItems = false;
    for (const token of tokens) {
        // Find last version

        if (!foundLastVersion) {
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
                        [, lastVersion] = matchedVersion;

                        foundLastVersion = true;
                    }
                }
            }
        }

        // Find last added items

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
                foundLastAddTitle = true;
            }
        }

        if (foundLastAddTitle && !foundLastAddItems) {
            if (token.type === "bullet_list_open" && token.map !== null) {
                const [listStartIndex, listEndIndex] = token.map;
                lastAddedItems = changelogContent
                    .split(/\r?\n/)
                    .slice(listStartIndex, listEndIndex);

                foundLastAddItems = true;
            }
        }
    }

    return {
        lastVersion,
        lastAddedItems,
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

async function updateReadmeFile(
    lastAddedItems: string[],
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
    const appendedFeatures = lastAddedItems
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
