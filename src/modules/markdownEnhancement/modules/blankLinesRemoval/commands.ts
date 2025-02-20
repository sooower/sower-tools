import { ViewColumn } from "vscode";

import { vscode } from "@/core";
import { extensionCtx, extensionName } from "@/core/context";

import { languageIds, skipFirstLine } from "./configs";

export function registerCommandRemoveBlankLines() {
    extensionCtx.subscriptions.push(
        vscode.commands.registerCommand(
            `${extensionName}.markdownEnhancement.removeBlankLines`,
            async (document: vscode.TextDocument) => {
                try {
                    if (document === undefined) {
                        return;
                    }

                    if (document.languageId !== "markdown") {
                        return;
                    }

                    await vscode.window.showTextDocument(
                        await vscode.workspace.openTextDocument({
                            content: await filterBlankLines(document),
                            language: "markdown",
                        }),
                        ViewColumn.Beside
                    );
                } catch (e) {
                    console.error(e);
                    vscode.window.showErrorMessage(`${e}`);
                }
            }
        )
    );
}

async function filterBlankLines(
    document: vscode.TextDocument
): Promise<string> {
    const lines = document.getText().split("\n");

    let isInsideCodeBlock = false;
    const outputLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
        if (skipFirstLine && i === 0) {
            continue;
        }

        const line = lines[i];

        const languageIdsRegex = languageIds.join("|");
        const codeBlockStartRegex = `^\\s*\`\`\`(${languageIdsRegex})(\\s|$)`;

        if (line.match(codeBlockStartRegex) !== null) {
            outputLines.push(line);
            isInsideCodeBlock = true;

            continue;
        }

        if (line.match(`^\\s*\`\`\`(\\s|$)`) !== null) {
            outputLines.push(line);
            isInsideCodeBlock = false;

            continue;
        }

        // Maintain all lines (including blank lines) inside code blocks
        if (isInsideCodeBlock) {
            outputLines.push(line);

            continue;
        }

        // Keep non-blank lines outside of code blocks
        if (line.trim() !== "") {
            outputLines.push(line);
        }
    }

    return outputLines.join("\n");
}
